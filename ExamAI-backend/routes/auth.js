import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/index.js";
import { protect } from "../middleware/auth.js";

const router   = express.Router();
const gClient  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

// ── Register ────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });

        if (await User.findOne({ email }))
            return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 12);
        const user   = await User.create({ name, email, password: hashed });

        res.status(201).json({
            token: signToken(user._id),
            user:  { _id: user._id, name: user.name, email: user.email, plan: user.plan },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Login ───────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: "Invalid email or password" });

        res.json({
            token: signToken(user._id),
            user:  { _id: user._id, name: user.name, email: user.email, plan: user.plan },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Google OAuth ────────────────────────────────────────────
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: "No credential" });

        const ticket  = await gClient.verifyIdToken({
            idToken:  credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            // Create new user from Google
            const randomPass = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);
            user = await User.create({ name, email, password: randomPass, googleId });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        res.json({
            token: signToken(user._id),
            user:  { _id: user._id, name: user.name, email: user.email, plan: user.plan },
        });
    } catch (err) {
        res.status(500).json({ message: "Google login failed: " + err.message });
    }
});

// ── Forgot Password ─────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always respond OK (security)
        if (!user) return res.json({ message: "If that email exists, a reset link was sent." });

        const token   = crypto.randomBytes(32).toString("hex");
        const expires = Date.now() + 1000 * 60 * 60; // 1 hour

        user.resetToken        = token;
        user.resetTokenExpires = expires;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

        await sendEmail({
            to: email,
            subject: "ExamAI — Reset your password",
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
          background:#0f0f1a;color:#f1f0ff;border-radius:16px;">
          <h2 style="color:#7c3aed;margin-bottom:8px;">ExamAI</h2>
          <h3 style="margin-bottom:16px;">Reset your password</h3>
          <p style="color:#6b6b9a;margin-bottom:24px;">
            Click the button below to reset your password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;padding:12px 28px;background:#7c3aed;
              color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">
            Reset Password →
          </a>
          <p style="color:#3a3a5e;margin-top:24px;font-size:12px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
        });

        res.json({ message: "If that email exists, a reset link was sent." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Reset Password ──────────────────────────────────────────
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({
            resetToken:        req.params.token,
            resetTokenExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ message: "Token invalid or expired" });

        user.password          = await bcrypt.hash(password, 12);
        user.resetToken        = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Me ──────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
    res.json(req.user);
});

export default router;
