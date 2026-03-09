import express from "express";
import { protect } from "../middleware/auth.js";
import { Note } from "../models/index.js";
import { generateNoteContent } from "../services/aiService.js";

const router = express.Router();

// ── Extract video ID ──────────────────────────────────────────
const extractVideoId = (url) => {
    const patterns = [
        /(?:v=)([^&\s]{11})/,
        /(?:youtu\.be\/)([^?\s]{11})/,
        /(?:embed\/)([^?\s]{11})/,
        /(?:shorts\/)([^?\s]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

// ── Get video info via oEmbed (no auth needed) ────────────────
const getVideoOEmbed = async (videoId) => {
    try {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const res  = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
};

// ── Scrape transcript + description from YouTube page ─────────
const scrapeYouTubePage = async (videoId) => {
    const result = { transcript: null, description: "", title: "", keywords: [] };

    try {
        const res = await fetch(
            `https://www.youtube.com/watch?v=${videoId}&hl=en`,
            {
                headers: {
                    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Cache-Control":   "no-cache",
                },
            }
        );

        const html = await res.text();

        // ── Extract title ──
        const titleMatch = html.match(/<title>([^<]*)<\/title>/);
        if (titleMatch) {
            result.title = titleMatch[1].replace(" - YouTube", "").trim();
        }

        // ── Extract description ──
        const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
        if (descMatch) {
            result.description = descMatch[1]
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\")
                .slice(0, 3000);
        }

        // ── Extract keywords ──
        const kwMatch = html.match(/"keywords":\[([^\]]*)\]/);
        if (kwMatch) {
            result.keywords = kwMatch[1]
                .split(",")
                .map(k => k.replace(/"/g, "").trim())
                .slice(0, 20);
        }

        // ── Extract caption tracks ──
        const captionMatch = html.match(/"captionTracks":(\[.*?\])/s);
        if (captionMatch) {
            try {
                const tracks = JSON.parse(captionMatch[1]);

                // Prefer English, then any language
                const sorted = [...tracks].sort((a, b) => {
                    const aEn = a.languageCode?.startsWith("en") ? 0 : 1;
                    const bEn = b.languageCode?.startsWith("en") ? 0 : 1;
                    return aEn - bEn;
                });

                for (const track of sorted) {
                    if (!track.baseUrl) continue;
                    try {
                        // Try JSON3 format first
                        const capRes  = await fetch(track.baseUrl + "&fmt=json3");
                        const capData = await capRes.json();

                        if (capData?.events) {
                            const text = capData.events
                                .filter(e => e.segs)
                                .flatMap(e => e.segs)
                                .map(s => s.utf8 || "")
                                .join(" ")
                                .replace(/\s+/g, " ")
                                .replace(/\n/g, " ")
                                .trim();

                            if (text.length > 200) {
                                result.transcript = text;
                                break;
                            }
                        }
                    } catch {
                        // Try XML format as fallback
                        try {
                            const capRes = await fetch(track.baseUrl);
                            const capXml = await capRes.text();
                            const texts  = capXml.match(/<text[^>]*>([^<]*)<\/text>/g) || [];
                            const text   = texts
                                .map(t => t.replace(/<[^>]+>/g, "")
                                    .replace(/&amp;/g, "&")
                                    .replace(/&lt;/g, "<")
                                    .replace(/&gt;/g, ">")
                                    .replace(/&#39;/g, "'")
                                    .replace(/&quot;/g, '"'))
                                .join(" ")
                                .trim();

                            if (text.length > 200) {
                                result.transcript = text;
                                break;
                            }
                        } catch {}
                    }
                }
            } catch {}
        }

    } catch (err) {
        console.error("YouTube scrape error:", err.message);
    }

    return result;
};

// ── Build context text ────────────────────────────────────────
const buildContextText = (scraped, oembed) => {
    const title = scraped.title || oembed?.title || "YouTube Video";
    const parts = [`Video Title: ${title}`];

    if (oembed?.author_name) parts.push(`Channel: ${oembed.author_name}`);
    if (scraped.keywords?.length) parts.push(`Topics: ${scraped.keywords.join(", ")}`);

    if (scraped.transcript) {
        parts.push(`\nFull Transcript:\n${scraped.transcript}`);
    } else if (scraped.description) {
        parts.push(`\nVideo Description:\n${scraped.description}`);
    }

    return { text: parts.join("\n"), hasTranscript: !!scraped.transcript, title };
};

// ── POST /api/youtube ─────────────────────────────────────────
router.post("/", protect, async (req, res) => {
    try {
        const { url, subject = "General", title: userTitle } = req.body;

        if (!url?.trim())
            return res.status(400).json({ message: "YouTube URL required" });

        const videoId = extractVideoId(url.trim());
        if (!videoId)
            return res.status(400).json({ message: "Invalid YouTube URL. Example: https://youtube.com/watch?v=xxxxx" });

        // Fetch info in parallel
        const [scraped, oembed] = await Promise.all([
            scrapeYouTubePage(videoId),
            getVideoOEmbed(videoId),
        ]);

        const { text, hasTranscript, title: autoTitle } = buildContextText(scraped, oembed);

        if (!text || text.length < 80) {
            return res.status(400).json({
                message: "Could not fetch video content. Make sure the URL is correct and the video is public.",
            });
        }

        const noteTitle = userTitle || autoTitle || "YouTube Notes";

        // Create note immediately
        const note = await Note.create({
            user:   req.user._id,
            title:  noteTitle,
            subject,
            status: "processing",
            icon:   "▶️",
            color:  "#f43f5e",
        });

        // Respond immediately
        res.json({
            noteId:     note._id,
            message:    "Processing started",
            hasTranscript,
        });

        // Background AI processing
        (async () => {
            try {
                const content = await generateNoteContent(text, subject);
                await Note.findByIdAndUpdate(note._id, {
                    status:                "ready",
                    summary:               content.summary               || "",
                    keyPoints:             content.keyPoints             || [],
                    simplifiedExplanation: content.simplifiedExplanation || "",
                    flashcards: (content.flashcards || []).map(f => ({
                        question:   f.question,
                        answer:     f.answer,
                        difficulty: f.difficulty || "medium",
                    })),
                    quiz: (content.quiz || []).map(q => ({
                        question:    q.question,
                        options:     q.options  || [],
                        correct:     q.correct  ?? 0,
                        explanation: q.explanation || "",
                    })),
                    diagrams: (content.diagrams || []).map(d => ({
                        diagramType: d.diagramType || "flowchart",
                        title:       d.title       || "",
                        data:        d.data        || {},
                    })),
                    tags: content.tags || [],
                });
            } catch (err) {
                console.error("AI processing error:", err.message);
                await Note.findByIdAndUpdate(note._id, {
                    status:          "error",
                    processingError: err.message,
                });
            }
        })();

    } catch (err) {
        console.error("YouTube route error:", err.message);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

export default router;
