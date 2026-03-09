import { useState, useEffect } from "react";
import { notesAPI, revisionAPI } from "../services/api.js";
import toast from "react-hot-toast";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const Badge = ({ children, color }) => (
    <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 10, fontWeight: 700, background: `${color}20`,
        color, border: `1px solid ${color}35`, textTransform: "uppercase",
    }}>{children}</span>
);

export default function Revision() {
    const [notes, setNotes]       = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [note, setNote]         = useState(null);
    const [cardIdx, setCardIdx]   = useState(0);
    const [flipped, setFlipped]   = useState(false);
    const [scores, setScores]     = useState({});
    const [done, setDone]         = useState(false);
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        notesAPI.getAll({ status: "ready" }).then(r => setNotes(r.data));
    }, []);

    const startRevision = async (noteId) => {
        try {
            const r = await notesAPI.getOne(noteId);
            if (!r.data.flashcards?.length) {
                toast.error("No flashcards in this note");
                return;
            }
            setNote(r.data);
            setSelectedNote(noteId);
            setCardIdx(0);
            setFlipped(false);
            setScores({});
            setDone(false);
        } catch {
            toast.error("Failed to load note");
        }
    };

    const handleAnswer = async (val) => {
        const newScores = { ...scores, [cardIdx]: val };
        setScores(newScores);

        if (cardIdx + 1 >= note.flashcards.length) {
            setSaving(true);
            const correct = Object.values(newScores).filter(v => v >= 3).length;
            try {
                await revisionAPI.saveSession({
                    noteId: note._id,
                    mode: "flashcard",
                    score: correct,
                    total: note.flashcards.length,
                });
                toast.success("Session saved!");
            } catch {}
            setSaving(false);
            setDone(true);
        } else {
            setCardIdx(i => i + 1);
            setFlipped(false);
        }
    };

    const correct = Object.values(scores).filter(v => v >= 3).length;
    const total   = note?.flashcards?.length || 0;

    // ── Topic Selection ───────────────────────────────────────
    if (!selectedNote) return (
        <div className="animate-in">
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    fontSize: 10, color: P.violet, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                }}>⚡ Spaced Repetition</div>
                <h1 style={{
                    fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                    fontFamily: "'Clash Display', sans-serif", marginBottom: 6,
                }}>Smart Revision</h1>
                <p style={{ color: P.muted, fontSize: 14 }}>
                    Pick a topic to start — AI tracks your weak points
                </p>
            </div>

            {notes.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px",
                    background: P.card, border: `2px dashed ${P.border}`,
                    borderRadius: 20, color: P.muted,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>No notes yet</div>
                    <div style={{ fontSize: 13 }}>Upload slides first to get flashcards</div>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 16,
                }}>
                    {notes.map(n => (
                        <div key={n._id} className="card-hover"
                             style={{
                                 background: P.card, border: `1px solid ${P.border}`,
                                 borderRadius: 18, padding: 22, position: "relative",
                                 overflow: "hidden",
                             }}>
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                background: `linear-gradient(90deg, ${n.color || P.violet}, transparent)`,
                            }} />

                            <div style={{ fontSize: 30, marginBottom: 10 }}>{n.icon || "📝"}</div>
                            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{n.title}</h3>
                            <div style={{ marginBottom: 12 }}>
                                <Badge color={n.color || P.violet}>{n.subject}</Badge>
                            </div>

                            {/* Mastery */}
                            <div style={{ marginBottom: 14 }}>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    fontSize: 11, color: P.muted, marginBottom: 4,
                                }}>
                                    <span>Mastery</span>
                                    <span style={{ color: n.color || P.violet, fontWeight: 700 }}>
                    {n.masteryLevel || 0}%
                  </span>
                                </div>
                                <div style={{ height: 4, background: P.border, borderRadius: 4 }}>
                                    <div style={{
                                        height: "100%", width: `${n.masteryLevel || 0}%`,
                                        background: n.color || P.violet, borderRadius: 4,
                                        boxShadow: `0 0 6px ${n.color || P.violet}60`,
                                    }} />
                                </div>
                            </div>

                            <button className="btn-hover" onClick={() => startRevision(n._id)}
                                    style={{
                                        width: "100%", padding: "10px", borderRadius: 10,
                                        border: "none", cursor: "pointer", fontWeight: 700,
                                        fontSize: 13, color: "#fff",
                                        background: `linear-gradient(135deg, ${n.color || P.violet}, ${n.color || P.violet}80)`,
                                        boxShadow: `0 4px 14px ${n.color || P.violet}40`,
                                    }}>
                                Start Revision →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ── Done Screen ───────────────────────────────────────────
    if (done) return (
        <div className="animate-in" style={{
            maxWidth: 500, margin: "0 auto",
            textAlign: "center", paddingTop: 60,
        }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
                {correct / total >= 0.8 ? "🏆" : correct / total >= 0.5 ? "👍" : "📚"}
            </div>
            <h2 style={{
                fontSize: 28, fontWeight: 900, marginBottom: 8,
                fontFamily: "'Clash Display', sans-serif",
            }}>Session Complete!</h2>
            <div style={{
                fontSize: 48, fontWeight: 900,
                color: note.color || P.violet, marginBottom: 8,
            }}>{correct}/{total}</div>
            <p style={{ color: P.muted, fontSize: 14, marginBottom: 8 }}>
                {Math.round(correct / total * 100)}% accuracy
            </p>
            <p style={{ color: P.muted, fontSize: 13, marginBottom: 32 }}>
                {correct / total >= 0.8
                    ? "Excellent work! 🌟"
                    : correct / total >= 0.5
                        ? "Good job! Keep going 💪"
                        : "Keep practicing, you'll get there! 📖"}
            </p>

            {/* Score breakdown */}
            <div style={{
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 16, padding: 20, marginBottom: 24,
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
            }}>
                {[
                    { label: "Easy", val: Object.values(scores).filter(v => v === 5).length, color: P.emerald },
                    { label: "Okay", val: Object.values(scores).filter(v => v === 3).length, color: P.amber },
                    { label: "Hard", val: Object.values(scores).filter(v => v === 1).length, color: P.rose },
                ].map(s => (
                    <div key={s.label}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: P.muted }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn-hover"
                        onClick={() => startRevision(selectedNote)}
                        style={{
                            padding: "12px 28px", borderRadius: 12, border: "none",
                            background: note.color || P.violet, color: "#fff",
                            cursor: "pointer", fontWeight: 700, fontSize: 15,
                        }}>
                    Try Again
                </button>
                <button onClick={() => { setSelectedNote(null); setNote(null); }}
                        style={{
                            padding: "12px 24px", borderRadius: 12,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: P.muted, cursor: "pointer",
                        }}>
                    Back
                </button>
            </div>
        </div>
    );

    // ── Flashcard Session ─────────────────────────────────────
    const cards = note.flashcards;

    return (
        <div className="animate-in" style={{ maxWidth: 560, margin: "0 auto" }}>
            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20,
            }}>
                <button onClick={() => { setSelectedNote(null); setNote(null); }}
                        style={{
                            padding: "8px 14px", borderRadius: 10,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: P.muted, cursor: "pointer", fontSize: 13,
                        }}>← Back</button>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800 }}>{note.title}</div>
                    <div style={{ fontSize: 11, color: P.muted }}>
                        Card {cardIdx + 1} of {cards.length}
                    </div>
                </div>
                <div style={{
                    fontSize: 13, color: P.emerald, fontWeight: 700,
                }}>✓ {correct}</div>
            </div>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: 3, marginBottom: 24 }}>
                {cards.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4, transition: "all 0.3s",
                        background: scores[i] >= 3 ? P.emerald
                            : scores[i] ? P.rose
                                : i === cardIdx ? note.color || P.violet
                                    : P.border,
                        boxShadow: i === cardIdx
                            ? `0 0 8px ${note.color || P.violet}` : "none",
                    }} />
                ))}
            </div>

            {/* Card */}
            <div onClick={() => setFlipped(!flipped)} style={{
                background: flipped
                    ? `linear-gradient(135deg, ${note.color || P.violet}20, ${P.card})`
                    : P.card,
                border: `1px solid ${flipped
                    ? (note.color || P.violet) + "60" : P.border}`,
                borderRadius: 22, padding: "48px 36px", textAlign: "center",
                minHeight: 220, cursor: "pointer",
                boxShadow: flipped
                    ? `0 0 40px ${note.color || P.violet}25` : "none",
                transition: "all 0.35s",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                marginBottom: 18,
            }}>
                <div style={{
                    fontSize: 10, color: P.muted, letterSpacing: 3,
                    textTransform: "uppercase", marginBottom: 20,
                }}>
                    {flipped ? "✨ Answer" : "💭 Question"} • tap to flip
                </div>
                <div style={{
                    fontSize: 19, fontWeight: flipped ? 600 : 700,
                    lineHeight: 1.6,
                    color: flipped ? (note.color || P.violet) : P.text,
                }}>
                    {flipped ? cards[cardIdx].answer : cards[cardIdx].question}
                </div>
                {cards[cardIdx].difficulty && (
                    <div style={{ marginTop: 16 }}>
                        <Badge color={
                            cards[cardIdx].difficulty === "hard" ? P.rose
                                : cards[cardIdx].difficulty === "medium" ? P.amber
                                    : P.emerald
                        }>{cards[cardIdx].difficulty}</Badge>
                    </div>
                )}
            </div>

            {/* Buttons */}
            {flipped ? (
                <div className="animate-in" style={{ display: "flex", gap: 10 }}>
                    {[
                        { label: "😕 Hard",  color: P.rose,    val: 1 },
                        { label: "🤔 Okay",  color: P.amber,   val: 3 },
                        { label: "😊 Easy",  color: P.emerald, val: 5 },
                    ].map(b => (
                        <button key={b.val} onClick={() => handleAnswer(b.val)}
                                style={{
                                    flex: 1, padding: "12px", borderRadius: 12,
                                    border: `1px solid ${b.color}40`,
                                    background: `${b.color}15`, color: b.color,
                                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                                    transition: "all 0.2s",
                                }}>{b.label}</button>
                    ))}
                </div>
            ) : (
                <button onClick={() => setFlipped(true)}
                        style={{
                            width: "100%", padding: "14px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg, ${note.color || P.violet}, ${note.color || P.violet}80)`,
                            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 15,
                            boxShadow: `0 4px 20px ${note.color || P.violet}40`,
                        }}>
                    Reveal Answer
                </button>
            )}
        </div>
    );
}
