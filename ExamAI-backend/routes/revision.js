import express from "express";
import { protect } from "../middleware/auth.js";
import { Note, RevisionSession, User } from "../models/index.js";

const router = express.Router();

router.post("/session", protect, async (req, res) => {
    try {
        const { noteId, mode, score, total } = req.body;
        const session = await RevisionSession.create({
            user: req.user.id, note: noteId, mode, score, total, completedAt: new Date(),
        });

        // Update mastery
        if (total > 0) {
            const mastery = Math.round((score / total) * 100);
            await Note.findByIdAndUpdate(noteId, { masteryLevel: mastery, lastReviewed: new Date() });
        }

        // Update streak
        const user = await User.findById(req.user.id);
        const today = new Date().setHours(0, 0, 0, 0);
        const last = user.lastStudyDate ? new Date(user.lastStudyDate).setHours(0, 0, 0, 0) : 0;
        const diff = (today - last) / 86400000;
        if (diff === 1) user.studyStreak += 1;
        else if (diff > 1) user.studyStreak = 1;
        user.lastStudyDate = new Date();
        await user.save();

        res.json({ session, streak: user.studyStreak });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/stats", protect, async (req, res) => {
    try {
        const sessions = await RevisionSession.find({ user: req.user.id });
        const notes = await Note.find({ user: req.user.id }).select("subject masteryLevel title");
        const avgScore = sessions.length
            ? sessions.reduce((s, r) => s + (r.score / (r.total || 1)), 0) / sessions.length * 100 : 0;
        res.json({ totalSessions: sessions.length, avgScore: Math.round(avgScore), totalNotes: notes.length, notes });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
