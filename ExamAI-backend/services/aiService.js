import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

let client = null;
const getClient = () => {
    if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY?.trim() });
    return client;
};

// ── Safe JSON extractor ───────────────────────────────────────
const extractJSON = (raw) => {
    // Remove markdown code blocks
    let cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // Try direct parse
    try { return JSON.parse(cleaned); } catch {}

    // Find first { to last }
    const start = cleaned.indexOf("{");
    const end   = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }

    // Fix common JSON issues
    try {
        const fixed = cleaned
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]")
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
            .replace(/:\s*'([^']*)'/g, ': "$1"');
        return JSON.parse(fixed);
    } catch {}

    return null;
};

// ── Fallback: build structure from plain text ─────────────────
const buildFallback = (text) => {
    const lines = text.split("\n").filter(l => l.trim().length > 20);
    return {
        summary:               lines.slice(0, 5).join(" ") || "Summary not available",
        simplifiedExplanation: lines.slice(5, 8).join(" ") || "Explanation not available",
        keyPoints:             lines.slice(0, 10).map(l => l.replace(/^[-*•\d.]+\s*/, "").trim()),
        flashcards:            [],
        quiz:                  [],
        diagrams:              [],
        tags:                  [],
    };
};

// ── Generate note content ─────────────────────────────────────
export const generateNoteContent = async (text, subject = "General") => {
    const groq = getClient();

    const maxChars = 10000;
    const truncated = text.length > maxChars
        ? text.slice(0, maxChars) + "..."
        : text;

    // Step 1: Generate summary + keypoints (simpler, less likely to fail JSON)
    const basicPrompt = `You are an expert tutor. Analyze this ${subject} study material and return ONLY a valid JSON object.

CONTENT:
${truncated}

Return this EXACT JSON structure with no extra text, no markdown, no code blocks:
{"summary":"Write 3-4 detailed paragraphs covering all main concepts. Minimum 250 words.","simplifiedExplanation":"Explain like teaching a beginner with real examples. Minimum 150 words.","keyPoints":["Complete sentence about concept 1 (min 15 words)","Complete sentence about concept 2 (min 15 words)","Complete sentence about concept 3","Complete sentence about concept 4","Complete sentence about concept 5","Complete sentence about concept 6","Complete sentence about concept 7","Complete sentence about concept 8","Complete sentence about concept 9","Complete sentence about concept 10"],"tags":["tag1","tag2","tag3","tag4"]}`;

    // Step 2: Generate flashcards separately
    const flashcardPrompt = `You are an expert tutor for ${subject}. Based on this content, create study flashcards.

CONTENT:
${truncated.slice(0, 5000)}

Return ONLY a valid JSON array with no extra text:
[{"question":"Specific question about an important concept?","answer":"Clear detailed answer with explanation and context.","difficulty":"easy"},{"question":"Another question?","answer":"Another detailed answer.","difficulty":"medium"},{"question":"Harder question?","answer":"Complex answer.","difficulty":"hard"}]

Generate exactly 12 flashcards covering all major topics. Mix easy, medium, and hard difficulties.`;

    // Step 3: Generate quiz separately
    const quizPrompt = `You are an expert tutor for ${subject}. Create multiple choice quiz questions.

CONTENT:
${truncated.slice(0, 5000)}

Return ONLY a valid JSON array with no extra text:
[{"question":"Clear question testing understanding?","options":["Option A","Option B","Option C","Option D"],"correct":0,"explanation":"Why A is correct and others are wrong."}]

Generate exactly 6 quiz questions. correct field is 0-based index of the right answer.`;

    try {
        // Run all 3 in parallel
        const [basicRes, flashRes, quizRes] = await Promise.all([
            groq.chat.completions.create({
                model:       "llama-3.3-70b-versatile",
                messages:    [{ role: "user", content: basicPrompt }],
                temperature: 0.2,
                max_tokens:  2500,
            }),
            groq.chat.completions.create({
                model:       "llama-3.3-70b-versatile",
                messages:    [{ role: "user", content: flashcardPrompt }],
                temperature: 0.2,
                max_tokens:  2500,
            }),
            groq.chat.completions.create({
                model:       "llama-3.3-70b-versatile",
                messages:    [{ role: "user", content: quizPrompt }],
                temperature: 0.2,
                max_tokens:  1500,
            }),
        ]);

        const basicRaw = basicRes.choices[0].message.content.trim();
        const flashRaw = flashRes.choices[0].message.content.trim();
        const quizRaw  = quizRes.choices[0].message.content.trim();

        // Parse each part
        const basic      = extractJSON(basicRaw)     || buildFallback(basicRaw);
        const flashcards = extractJSON(flashRaw)     || [];
        const quiz       = extractJSON(quizRaw)      || [];

        return {
            summary:               basic.summary               || "",
            simplifiedExplanation: basic.simplifiedExplanation || "",
            keyPoints:             basic.keyPoints             || [],
            tags:                  basic.tags                  || [],
            flashcards: Array.isArray(flashcards) ? flashcards.map(f => ({
                question:   f.question   || "",
                answer:     f.answer     || "",
                difficulty: f.difficulty || "medium",
            })) : [],
            quiz: Array.isArray(quiz) ? quiz.map(q => ({
                question:    q.question    || "",
                options:     q.options     || [],
                correct:     q.correct     ?? 0,
                explanation: q.explanation || "",
            })) : [],
            diagrams: [],
        };

    } catch (err) {
        console.error("AI generation error:", err.message);
        throw new Error("AI processing failed: " + err.message);
    }
};

// ── Ask about topic ───────────────────────────────────────────
export const askAboutTopic = async (question, context, subject = "General") => {
    const groq = getClient();

    const truncatedContext = context.length > 4000
        ? context.slice(0, 4000) + "..."
        : context;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `You are an expert ${subject} tutor. Give clear, detailed, educational answers. Use bullet points or numbered lists when helpful. Be thorough but easy to understand.`,
            },
            {
                role: "user",
                content: `Study material context:\n${truncatedContext}\n\nStudent question: ${question}`,
            },
        ],
        temperature: 0.5,
        max_tokens:  1200,
    });

    return response.choices[0].message.content.trim();
};
