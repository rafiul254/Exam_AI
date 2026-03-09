import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notesAPI } from "../services/api.js";
import toast from "react-hot-toast";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", violetLight: "#a78bfa", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const SUBJECTS = ["All", "Biology", "Physics", "Chemistry",
    "Mathematics", "History", "Computer Science", "Economics", "General"];

const Badge = ({ children, color }) => (
    <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 10, fontWeight: 700, background: `${color}20`,
        color, border: `1px solid ${color}35`, textTransform: "uppercase",
    }}>{children}</span>
);

export default function Notes() {
    const [notes, setNotes]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");
    const [subject, setSubject]   = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        notesAPI.getAll().then(r => {
            setNotes(r.data);
            setLoading(false);
        });
    }, []);

    const filtered = notes.filter(n => {
        const matchSearch =
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.subject.toLowerCase().includes(search.toLowerCase());
        const matchSubject = subject === "All" || n.subject === subject;
        return matchSearch && matchSubject;
    });

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Delete this note?")) return;
        await notesAPI.delete(id);
        setNotes(notes.filter(n => n._id !== id));
        toast.success("Note deleted");
    };

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 24,
            }}>
                <div>
                    <h1 style={{
                        fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                        fontFamily: "'Clash Display', sans-serif", marginBottom: 4,
                    }}>Smart Notes</h1>
                    <p style={{ color: P.muted, fontSize: 14 }}>
                        {notes.length} notes generated
                    </p>
                </div>
                <button className="btn-hover" onClick={() => navigate("/upload")}
                        style={{
                            padding: "10px 20px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}90)`,
                            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13,
                            boxShadow: `0 4px 16px ${P.violet}40`,
                        }}>
                    + New Note
                </button>
            </div>

            {/* Search + Filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <input
                    placeholder="🔍  Search notes..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200, padding: "10px 16px",
                        borderRadius: 12, fontSize: 14,
                        background: "#13131f", border: `1px solid ${P.border}`,
                        color: P.text, outline: "none",
                    }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {SUBJECTS.slice(0, 5).map(sub => (
                        <button key={sub} onClick={() => setSubject(sub)}
                                style={{
                                    padding: "8px 14px", borderRadius: 10,
                                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                                    background: subject === sub ? P.violet : "#13131f",
                                    color: subject === sub ? "#fff" : P.muted,
                                    border: `1px solid ${subject === sub ? P.violet + "60" : P.border}`,
                                    transition: "all 0.2s",
                                }}>{sub}</button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 18,
                }}>
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="shimmer" style={{ height: 200, borderRadius: 18 }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px",
                    color: P.muted,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                        No notes found
                    </div>
                    <div style={{ fontSize: 13 }}>Try a different search or upload new slides</div>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 18,
                }}>
                    {filtered.map(note => (
                        <div key={note._id} className="card-hover"
                             onClick={() => navigate(`/notes/${note._id}`)}
                             style={{
                                 background: P.card, border: `1px solid ${P.border}`,
                                 borderRadius: 18, padding: 22, cursor: "pointer",
                                 position: "relative", overflow: "hidden",
                             }}>

                            {/* Top accent line */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                background: `linear-gradient(90deg, ${note.color || P.violet}, transparent)`,
                            }} />

                            {/* Status */}
                            {note.status === "processing" && (
                                <div style={{
                                    position: "absolute", top: 12, right: 12,
                                    fontSize: 9, background: `${P.amber}20`, color: P.amber,
                                    padding: "3px 8px", borderRadius: 6, fontWeight: 700,
                                    border: `1px solid ${P.amber}30`,
                                }}>⏳ Processing</div>
                            )}
                            {note.status === "error" && (
                                <div style={{
                                    position: "absolute", top: 12, right: 12,
                                    fontSize: 9, background: `${P.rose}20`, color: P.rose,
                                    padding: "3px 8px", borderRadius: 6, fontWeight: 700,
                                }}>❌ Error</div>
                            )}

                            <div style={{ fontSize: 34, marginBottom: 12 }}>{note.icon || "📝"}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{note.title}</h3>
                            <div style={{ marginBottom: 12 }}>
                                <Badge color={note.color || P.violet}>{note.subject}</Badge>
                            </div>
                            <p style={{
                                color: P.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 16,
                            }}>
                                {note.summary
                                    ? note.summary.slice(0, 80) + "..."
                                    : "Processing your notes..."}
                            </p>

                            {/* Tags */}
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                                {note.flashcards?.length > 0 && (
                                    <span style={{
                                        fontSize: 9, padding: "2px 8px", borderRadius: 6,
                                        background: P.surface, color: P.muted,
                                    }}>🃏 {note.flashcards.length} cards</span>
                                )}
                                {note.quiz?.length > 0 && (
                                    <span style={{
                                        fontSize: 9, padding: "2px 8px", borderRadius: 6,
                                        background: P.surface, color: P.muted,
                                    }}>🎯 Quiz</span>
                                )}
                                {note.diagrams?.length > 0 && (
                                    <span style={{
                                        fontSize: 9, padding: "2px 8px", borderRadius: 6,
                                        background: `${note.color || P.violet}20`,
                                        color: note.color || P.violet,
                                    }}>📊 Diagram</span>
                                )}
                            </div>

                            {/* Mastery */}
                            <div style={{
                                height: 4, background: P.border, borderRadius: 4, marginBottom: 6,
                            }}>
                                <div style={{
                                    height: "100%", width: `${note.masteryLevel || 0}%`,
                                    background: `linear-gradient(90deg, ${note.color || P.violet}, ${note.color || P.violet}80)`,
                                    borderRadius: 4,
                                    boxShadow: `0 0 6px ${note.color || P.violet}60`,
                                }} />
                            </div>
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: 10, color: P.muted,
                            }}>
                                <span>{note.masteryLevel || 0}% mastered</span>
                                <button onClick={e => handleDelete(note._id, e)}
                                        style={{
                                            background: "none", border: "none",
                                            color: P.rose, cursor: "pointer", fontSize: 11,
                                        }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
