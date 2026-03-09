import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { uploadAPI } from "../services/api.js";
import axios from "axios";
import toast from "react-hot-toast";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", cyan: "#06b6d4", amber: "#f59e0b",
    emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const SUBJECTS = [
    "General","Biology","Physics","Chemistry","Mathematics",
    "History","Geography","Computer Science","Economics",
];

const steps = [
    "📄 Uploading...",
    "🔍 Extracting text...",
    "🧠 Analyzing content...",
    "📊 Generating diagrams...",
    "🃏 Creating flashcards...",
    "✅ Done!",
];

export default function Upload() {
    const [method, setMethod]     = useState("file");
    const [file, setFile]         = useState(null);
    const [ytUrl, setYtUrl]       = useState("");
    const [subject, setSubject]   = useState("General");
    const [title, setTitle]       = useState("");
    const [uploading, setUploading] = useState(false);
    const [step, setStep]         = useState(0);

    // Voice
    const [recording, setRecording]       = useState(false);
    const [transcript, setTranscript]     = useState("");
    const recognitionRef                  = useRef(null);

    // OCR
    const [ocrImage, setOcrImage]         = useState(null);
    const [ocrPreview, setOcrPreview]     = useState("");
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [ocrText, setOcrText]           = useState("");

    const navigate = useNavigate();

    // ── Dropzone ──────────────────────────────────────────────
    const onDrop = useCallback((accepted) => {
        if (accepted[0]) {
            setFile(accepted[0]);
            setTitle(accepted[0].name.replace(/\.[^.]+$/, ""));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
        maxFiles: 1,
    });

    // ── Poll for completion ───────────────────────────────────
    const pollStatus = (noteId) => {
        const poll = setInterval(async () => {
            try {
                const status = await uploadAPI.status(noteId);
                if (status.data.status === "ready") {
                    clearInterval(poll);
                    setStep(5);
                    setTimeout(() => {
                        toast.success("Notes generated! 🎉");
                        navigate(`/notes/${noteId}`);
                    }, 800);
                } else if (status.data.status === "error") {
                    clearInterval(poll);
                    toast.error("Processing failed: " + status.data.processingError);
                    setUploading(false);
                }
            } catch {}
        }, 2500);
    };

    // ── Upload File ───────────────────────────────────────────
    const handleFileUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStep(0);
        const interval = setInterval(() =>
            setStep(s => s < 3 ? s + 1 : s), 900);
        try {
            const r = await uploadAPI.upload(file, subject, title || file.name);
            clearInterval(interval);
            setStep(4);
            pollStatus(r.data.noteId);
        } catch (err) {
            clearInterval(interval);
            toast.error(err.response?.data?.message || "Upload failed");
            setUploading(false);
        }
    };

    // ── YouTube ───────────────────────────────────────────────
    const handleYouTube = async () => {
        if (!ytUrl.trim()) return toast.error("Enter a YouTube URL");
        setUploading(true);
        setStep(0);
        const interval = setInterval(() =>
            setStep(s => s < 3 ? s + 1 : s), 1200);
        try {
            const r = await axios.post("/api/youtube", {
                url: ytUrl, subject, title: title || "",
            });
            clearInterval(interval);
            setStep(4);
            pollStatus(r.data.noteId);
        } catch (err) {
            clearInterval(interval);
            toast.error(err.response?.data?.message || "Failed to process YouTube video");
            setUploading(false);
        }
    };

    // ── Voice Recording ───────────────────────────────────────
    const startRecording = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition not supported in this browser");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous     = true;
        recognition.interimResults = true;
        recognition.lang           = "en-US";

        recognition.onresult = (e) => {
            let final = "";
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
            }
            setTranscript(final);
        };
        recognition.onerror = () => {
            toast.error("Recording error");
            setRecording(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
        setRecording(true);
        setTranscript("");
        toast.success("Recording started — speak now!");
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setRecording(false);
        toast.success("Recording stopped");
    };

    const handleVoiceUpload = async () => {
        if (!transcript.trim()) return toast.error("No transcript recorded");
        setUploading(true);
        setStep(0);
        const interval = setInterval(() =>
            setStep(s => s < 3 ? s + 1 : s), 900);
        try {
            const blob = new Blob([transcript], { type: "text/plain" });
            const textFile = new File([blob], "voice-recording.txt", { type: "text/plain" });
            const r = await uploadAPI.upload(textFile, subject, title || "Voice Recording");
            clearInterval(interval);
            setStep(4);
            pollStatus(r.data.noteId);
        } catch (err) {
            clearInterval(interval);
            toast.error("Upload failed");
            setUploading(false);
        }
    };

    // ── Photo OCR ─────────────────────────────────────────────
    const handleOcrImage = async (e) => {
        const imgFile = e.target.files[0];
        if (!imgFile) return;
        setOcrImage(imgFile);
        setOcrPreview(URL.createObjectURL(imgFile));
        setOcrProcessing(true);
        setOcrText("");
        toast("Extracting text from image...", { icon: "🔍" });
        try {
            const Tesseract = (await import("tesseract.js")).default;
            const { data: { text } } = await Tesseract.recognize(imgFile, "eng");
            setOcrText(text);
            toast.success("Text extracted!");
        } catch {
            toast.error("OCR failed");
        } finally {
            setOcrProcessing(false);
        }
    };

    const handleOcrUpload = async () => {
        if (!ocrText.trim()) return toast.error("No text extracted yet");
        setUploading(true);
        setStep(0);
        const interval = setInterval(() =>
            setStep(s => s < 3 ? s + 1 : s), 900);
        try {
            const blob = new Blob([ocrText], { type: "text/plain" });
            const textFile = new File([blob], "ocr-notes.txt", { type: "text/plain" });
            const r = await uploadAPI.upload(textFile, subject, title || "Photo Notes");
            clearInterval(interval);
            setStep(4);
            pollStatus(r.data.noteId);
        } catch (err) {
            clearInterval(interval);
            toast.error("Upload failed");
            setUploading(false);
        }
    };

    const methods = [
        { key: "file",    icon: "📄", label: "PDF / TXT",  color: P.violet,  active: true },
        { key: "voice",   icon: "🎙️", label: "Voice",      color: P.cyan,    active: true },
        { key: "photo",   icon: "📸", label: "Photo OCR",  color: P.amber,   active: true },
        { key: "youtube", icon: "▶️", label: "YouTube",    color: P.rose,    active: true },
    ];

    const currentColor = methods.find(m => m.key === method)?.color || P.violet;

    return (
        <div className="animate-in" style={{ maxWidth: 660, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    fontSize: 10, color: P.violet, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                }}>✦ AI Generation</div>
                <h1 style={{
                    fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                    fontFamily: "'Clash Display', sans-serif", marginBottom: 6,
                }}>Upload & Generate</h1>
                <p style={{ color: P.muted, fontSize: 14 }}>
                    AI will create notes, flashcards, diagrams & quiz automatically
                </p>
            </div>

            {/* Method Tabs */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10, marginBottom: 24,
            }}>
                {methods.map(m => (
                    <div key={m.key}
                         onClick={() => { setMethod(m.key); setUploading(false); }}
                         style={{
                             background: method === m.key ? `${m.color}18` : P.card,
                             border: `1px solid ${method === m.key ? m.color + "55" : P.border}`,
                             borderRadius: 14, padding: "14px 10px", textAlign: "center",
                             cursor: "pointer", transition: "all 0.2s",
                         }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                        <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: method === m.key ? m.color : P.muted,
                        }}>{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Subject + Title */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 14, marginBottom: 20,
            }}>
                <div>
                    <label style={{
                        fontSize: 11, color: P.muted, display: "block",
                        marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                        textTransform: "uppercase",
                    }}>Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                           placeholder="Note title (optional)"
                           style={{
                               width: "100%", padding: "10px 14px", borderRadius: 10,
                               border: `1px solid ${P.border}`, background: P.surface,
                               color: P.text, fontSize: 13, outline: "none",
                           }} />
                </div>
                <div>
                    <label style={{
                        fontSize: 11, color: P.muted, display: "block",
                        marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                        textTransform: "uppercase",
                    }}>Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)}
                            style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                border: `1px solid ${P.border}`, background: P.surface,
                                color: P.text, fontSize: 13, outline: "none",
                            }}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* ── Processing Screen ── */}
            {uploading ? (
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 36, textAlign: "center",
                }}>
                    <div style={{
                        fontSize: 44, marginBottom: 20,
                        animation: "pulse 1.5s ease-in-out infinite",
                    }}>🧠</div>
                    <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                        AI is working...
                    </h3>
                    <p style={{ color: P.muted, fontSize: 13, marginBottom: 28 }}>
                        This may take 30–60 seconds
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                fontSize: 13, color: i <= step ? P.text : P.muted,
                                transition: "color 0.3s",
                            }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, color: "#fff", transition: "all 0.3s",
                                    background: i < step ? P.emerald : i === step ? P.violet : P.border,
                                    boxShadow: i === step ? `0 0 12px ${P.violet}` : "none",
                                }}>
                                    {i < step ? "✓" : ""}
                                </div>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

            ) : method === "file" ? (
                /* ── PDF / TXT ── */
                <div>
                    <div {...getRootProps()} style={{
                        border: `2px dashed ${isDragActive ? P.violet : file ? P.emerald : P.border}`,
                        borderRadius: 20, padding: "50px 40px", textAlign: "center",
                        cursor: "pointer", background: isDragActive ? `${P.violet}08` : P.surface,
                        transition: "all 0.3s", marginBottom: 16,
                    }}>
                        <input {...getInputProps()} />
                        {file ? (
                            <div>
                                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{file.name}</div>
                                <div style={{ color: P.muted, fontSize: 13, marginBottom: 12 }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <button onClick={e => { e.stopPropagation(); setFile(null); }}
                                        style={{
                                            padding: "6px 14px", borderRadius: 8,
                                            border: `1px solid ${P.border}`, background: "transparent",
                                            color: P.muted, cursor: "pointer", fontSize: 12,
                                        }}>Remove</button>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    fontSize: 44, marginBottom: 14, opacity: 0.5,
                                    animation: "float 3s ease-in-out infinite",
                                }}>📄</div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                                    {isDragActive ? "Drop it here!" : "Drop your file here"}
                                </div>
                                <div style={{ color: P.muted, fontSize: 13, marginBottom: 18 }}>
                                    PDF or TXT • Max 50MB
                                </div>
                                <div style={{
                                    display: "inline-block", padding: "10px 24px", borderRadius: 10,
                                    background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}80)`,
                                    color: "#fff", fontWeight: 700, fontSize: 14,
                                    boxShadow: `0 4px 20px ${P.violet}40`,
                                }}>Browse Files</div>
                            </div>
                        )}
                    </div>
                    {file && (
                        <button onClick={handleFileUpload}
                                style={{
                                    width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                    background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}80)`,
                                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                                    boxShadow: `0 4px 24px ${P.violet}40`,
                                }}>
                            ✦ Generate AI Notes
                        </button>
                    )}
                </div>

            ) : method === "voice" ? (
                /* ── Voice Recording ── */
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 32,
                }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{
                            fontSize: 56, marginBottom: 16,
                            animation: recording ? "pulse 1s ease-in-out infinite" : "none",
                        }}>🎙️</div>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                            {recording ? "Recording..." : "Voice to Notes"}
                        </div>
                        <div style={{ color: P.muted, fontSize: 13 }}>
                            Record a lecture or speak your notes — AI will generate everything
                        </div>
                    </div>

                    {/* Recording button */}
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                        {!recording ? (
                            <button onClick={startRecording}
                                    style={{
                                        padding: "13px 32px", borderRadius: 12, border: "none",
                                        background: `linear-gradient(135deg, ${P.cyan}, ${P.violet})`,
                                        color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                                        boxShadow: `0 4px 20px ${P.cyan}40`,
                                    }}>
                                🔴 Start Recording
                            </button>
                        ) : (
                            <button onClick={stopRecording}
                                    style={{
                                        padding: "13px 32px", borderRadius: 12, border: "none",
                                        background: P.rose, color: "#fff", fontWeight: 700,
                                        fontSize: 15, cursor: "pointer",
                                        boxShadow: `0 4px 20px ${P.rose}40`,
                                        animation: "pulse 1.5s ease-in-out infinite",
                                    }}>
                                ⏹ Stop Recording
                            </button>
                        )}
                    </div>

                    {/* Transcript */}
                    {transcript && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{
                                fontSize: 11, color: P.muted, fontWeight: 700,
                                letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
                            }}>Transcript</div>
                            <div style={{
                                background: P.surface, borderRadius: 12, padding: 16,
                                border: `1px solid ${P.border}`,
                                fontSize: 13, lineHeight: 1.7, color: P.text,
                                maxHeight: 150, overflowY: "auto",
                            }}>{transcript}</div>
                        </div>
                    )}

                    {transcript && !recording && (
                        <button onClick={handleVoiceUpload}
                                style={{
                                    width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                    background: `linear-gradient(135deg, ${P.cyan}, ${P.violet})`,
                                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                                    boxShadow: `0 4px 24px ${P.cyan}40`,
                                }}>
                            ✦ Generate Notes from Recording
                        </button>
                    )}
                </div>

            ) : method === "photo" ? (
                /* ── Photo OCR ── */
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 32,
                }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                            Photo OCR
                        </div>
                        <div style={{ color: P.muted, fontSize: 13 }}>
                            Take a photo of handwritten notes or a textbook page
                        </div>
                    </div>

                    {!ocrImage ? (
                        <label style={{ display: "block", cursor: "pointer" }}>
                            <input type="file" accept="image/*" onChange={handleOcrImage}
                                   style={{ display: "none" }} />
                            <div style={{
                                border: `2px dashed ${P.border}`, borderRadius: 16,
                                padding: "40px 30px", textAlign: "center",
                                transition: "all 0.2s",
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>🖼️</div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                                    Click to upload image
                                </div>
                                <div style={{ color: P.muted, fontSize: 13 }}>
                                    JPG, PNG, HEIC supported
                                </div>
                            </div>
                        </label>
                    ) : (
                        <div>
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr",
                                gap: 16, marginBottom: 20,
                            }}>
                                {/* Image preview */}
                                <div>
                                    <div style={{
                                        fontSize: 11, color: P.muted, fontWeight: 700,
                                        letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
                                    }}>Image</div>
                                    <img src={ocrPreview} alt="OCR"
                                         style={{
                                             width: "100%", borderRadius: 12,
                                             border: `1px solid ${P.border}`,
                                             maxHeight: 200, objectFit: "cover",
                                         }} />
                                </div>
                                {/* Extracted text */}
                                <div>
                                    <div style={{
                                        fontSize: 11, color: P.muted, fontWeight: 700,
                                        letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
                                        display: "flex", alignItems: "center", gap: 8,
                                    }}>
                                        Extracted Text
                                        {ocrProcessing && (
                                            <span style={{
                                                fontSize: 10, color: P.amber,
                                                animation: "pulse 1s ease-in-out infinite",
                                            }}>Scanning...</span>
                                        )}
                                    </div>
                                    <textarea value={ocrText}
                                              onChange={e => setOcrText(e.target.value)}
                                              placeholder={ocrProcessing ? "Extracting..." : "Text will appear here..."}
                                              style={{
                                                  width: "100%", height: 160, padding: "10px 12px",
                                                  borderRadius: 10, border: `1px solid ${P.border}`,
                                                  background: P.surface, color: P.text,
                                                  fontSize: 12, resize: "none", outline: "none",
                                                  lineHeight: 1.6,
                                              }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => {
                                    setOcrImage(null); setOcrPreview("");
                                    setOcrText(""); setOcrProcessing(false);
                                }}
                                        style={{
                                            padding: "11px 20px", borderRadius: 10,
                                            border: `1px solid ${P.border}`, background: "transparent",
                                            color: P.muted, cursor: "pointer",
                                        }}>
                                    ← Retake
                                </button>
                                <button onClick={handleOcrUpload} disabled={!ocrText || ocrProcessing}
                                        style={{
                                            flex: 1, padding: "12px", borderRadius: 10, border: "none",
                                            background: ocrText && !ocrProcessing
                                                ? `linear-gradient(135deg, ${P.amber}, ${P.rose})`
                                                : P.border,
                                            color: ocrText && !ocrProcessing ? "#fff" : P.muted,
                                            cursor: ocrText && !ocrProcessing ? "pointer" : "not-allowed",
                                            fontWeight: 700, fontSize: 14,
                                        }}>
                                    ✦ Generate Notes from Photo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            ) : method === "youtube" ? (
                /* ── YouTube ── */
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 32,
                }}>
                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>▶️</div>
                        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                            YouTube to Notes
                        </div>
                        <div style={{ color: P.muted, fontSize: 13 }}>
                            Paste any YouTube video link — AI extracts the transcript and generates notes
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            fontSize: 11, color: P.muted, display: "block",
                            marginBottom: 8, fontWeight: 700, letterSpacing: 1,
                            textTransform: "uppercase",
                        }}>YouTube URL</label>
                        <input
                            value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            style={{
                                width: "100%", padding: "13px 16px", borderRadius: 12,
                                border: `1px solid ${P.rose}40`,
                                background: P.surface, color: P.text,
                                fontSize: 14, outline: "none",
                            }}
                            onFocus={e => e.target.style.borderColor = P.rose}
                            onBlur={e => e.target.style.borderColor = `${P.rose}40`}
                        />
                    </div>

                    {/* Examples */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            fontSize: 11, color: P.muted, marginBottom: 10,
                            fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        }}>Works best with</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {[
                                "Lectures", "Tutorials", "Documentaries",
                                "TED Talks", "Explainers",
                            ].map(tag => (
                                <span key={tag} style={{
                                    padding: "4px 12px", borderRadius: 8,
                                    background: `${P.rose}15`, color: P.rose,
                                    fontSize: 11, fontWeight: 600,
                                    border: `1px solid ${P.rose}30`,
                                }}>{tag}</span>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleYouTube} disabled={!ytUrl.trim()}
                            style={{
                                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                background: ytUrl.trim()
                                    ? `linear-gradient(135deg, ${P.rose}, ${P.amber})`
                                    : P.border,
                                color: ytUrl.trim() ? "#fff" : P.muted,
                                fontSize: 15, fontWeight: 700,
                                cursor: ytUrl.trim() ? "pointer" : "not-allowed",
                                boxShadow: ytUrl.trim() ? `0 4px 24px ${P.rose}40` : "none",
                            }}>
                        ✦ Generate Notes from Video
                    </button>
                </div>
            ) : null}

            {/* What AI generates */}
            {!uploading && (
                <div style={{
                    background: P.surface, borderRadius: 14,
                    padding: 16, marginTop: 20,
                    border: `1px solid ${P.border}`,
                }}>
                    <div style={{
                        fontSize: 10, color: P.muted, fontWeight: 700,
                        letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
                    }}>✦ AI will generate</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {[
                            "📝 Summary", "⚡ Key Points",
                            "🃏 Flashcards", "📊 Diagrams",
                            "🎯 Quiz", "💡 Simple Explanation",
                        ].map(item => (
                            <div key={item} style={{
                                display: "flex", alignItems: "center", gap: 6,
                                fontSize: 12, color: P.text,
                            }}>
                                <div style={{
                                    width: 5, height: 5, borderRadius: "50%",
                                    background: currentColor, flexShrink: 0,
                                }} />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
