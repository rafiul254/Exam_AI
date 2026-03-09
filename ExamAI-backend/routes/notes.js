import express from "express";
import { Note } from "../models/index.js";
import { askAboutTopic } from "../services/aiService.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notes
router.get("/", protect, async (req, res) => {
    try {
        const filter = { user: req.user._id };
        if (req.query.status) filter.status = req.query.status;
        const notes = await Note.find(filter).sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/notes/:id
router.get("/:id", protect, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/notes/:id
router.delete("/:id", protect, async (req, res) => {
    try {
        await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notes/:id/mastery
router.put("/:id/mastery", protect, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { masteryLevel: req.body.masteryLevel },
            { new: true }
        );
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notes/:id/ask  ← ChatGPT-style Q&A
router.post("/:id/ask", protect, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: "Question required" });

        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: "Note not found" });

        // Build context from note content
        const context = `
      Title: ${note.title}
      Subject: ${note.subject}
      Summary: ${note.summary}
      Key Points: ${note.keyPoints.join(". ")}
      Simplified Explanation: ${note.simplifiedExplanation}
    `.trim();

        const answer = await askAboutTopic(question, context, note.subject);
        res.json({ answer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
