import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", {
    MONGO: process.env.MONGO_URI ? "✅" : "❌",
    ANTHROPIC: process.env.ANTHROPIC_API_KEY ? "✅" : "❌",
    KEY_START: process.env.ANTHROPIC_API_KEY?.substring(0, 25) + "..."
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import uploadRoutes from "./routes/upload.js";
import revisionRoutes from "./routes/revision.js";
import youtubeRoutes from "./routes/youtube.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rafi-examai.netlify.app",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/youtube", youtubeRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(process.env.PORT || 5000, () =>
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
        );
    })
    .catch(err => {
        console.error("❌ DB Error:", err);
        process.exit(1);
    });
