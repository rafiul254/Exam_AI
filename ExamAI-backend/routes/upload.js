import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Note from "../models/index.js";
import { generateNoteContent } from "../services/aiService.js";
import authMiddleware from "../middleware/auth.js";
import pdfParse from "pdf-parse";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [".pdf", ".txt"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error("Only PDF and TXT files allowed"));
    },
});

// POST /api/upload
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const { subject = "General", title } = req.body;
        const noteTitle = title || req.file.originalname.replace(/\.[^.]+$/, "");

        const note = await Note.create({
            user: req.user._id,
            title: noteTitle,
            subject,
            status: "processing",
            icon: getIcon(subject),
            color: getColor(subject),
        });

        res.json({ noteId: note._id, message: "Processing started" });

        // Background processing
        processNote(note._id, req.file, subject);

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
});

// GET /api/upload/status/:noteId
router.get("/status/:noteId", authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.noteId,
            user: req.user._id,
        }).select("status processingError title");
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json({ status: note.status, processingError: note.processingError });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function processNote(noteId, file, subject) {
    try {
        let text = "";

        if (file.mimetype === "application/pdf") {
            const dataBuffer = fs.readFileSync(file.path);
            const parsed = await pdfParse(dataBuffer);
            text = parsed.text;
        } else {
            text = fs.readFileSync(file.path, "utf-8");
        }

        if (!text || text.trim().length < 50) {
            await Note.findByIdAndUpdate(noteId, {
                status: "error",
                processingError: "Could not extract enough text from file",
            });
            return;
        }

        const content = await generateNoteContent(text, subject);

        await Note.findByIdAndUpdate(noteId, {
            status: "ready",
            summary: content.summary || "",
            keyPoints: content.keyPoints || [],
            simplifiedExplanation: content.simplifiedExplanation || "",
            flashcards: (content.flashcards || []).map(f => ({
                question: f.question,
                answer: f.answer,
                difficulty: f.difficulty || "medium",
            })),
            quiz: (content.quiz || []).map(q => ({
                question: q.question,
                options: q.options || [],
                correct: q.correct ?? 0,
                explanation: q.explanation || "",
            })),
            diagrams: (content.diagrams || []).map(d => ({
                diagramType: d.diagramType || d.type || "flowchart",
                title: d.title || "",
                data: d.data || {},
            })),
            charts: (content.charts || []).map(c => ({
                chartType: c.chartType || c.type || "bar",
                title: c.title || "",
                data: c.data || {},
            })),
            tags: content.tags || [],
            processingError: null,
        });

        // Cleanup uploaded file
        try { fs.unlinkSync(file.path); } catch {}

    } catch (err) {
        console.error("Processing error:", err);
        await Note.findByIdAndUpdate(noteId, {
            status: "error",
            processingError: err.message,
        });
    }
}

function getIcon(subject) {
    const map = {
        Biology: "🌿", Physics: "⚛️", Chemistry: "🧪",
        Mathematics: "∑", History: "🏛️", Geography: "🌍",
        "Computer Science": "💻", Economics: "📈",
    };
    return map[subject] || "📝";
}

function getColor(subject) {
    const map = {
        Biology: "#10b981", Physics: "#7c3aed", Chemistry: "#f59e0b",
        Mathematics: "#f59e0b", History: "#f43f5e", Geography: "#06b6d4",
        "Computer Science": "#06b6d4", Economics: "#a78bfa",
    };
    return map[subject] || "#7c3aed";
}

export default router;
