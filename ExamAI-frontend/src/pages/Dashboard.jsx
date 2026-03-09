import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { notesAPI, revisionAPI } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import PomodoroWidget from "../components/PomodoroWidget.jsx";
import ExamCountdown from "../components/ExamCountdown.jsx";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", violetLight: "#a78bfa", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const Badge = ({ children, color }) => (
    <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.5px",
        background: `${color}20`, color, border: `1px solid ${color}35`,
        textTransform: "uppercase",
    }}>{children}</span>
);

export default function Dashboard() {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const [notes, setNotes]   = useState([]);
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            notesAPI.getAll(),
            revisionAPI.stats(),
        ]).then(([notesRes, statsRes]) => {
            setNotes(notesRes.data.slice(0, 4));
            setStats(statsRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 28,
            }}>
                <div>
                    <div style={{
                        fontSize: 10, color: P.violet, fontWeight: 700,
                        letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                    }}>✦ Welcome back</div>
                    <h1 style={{
                        fontSize: 32, fontWeight: 900, letterSpacing: "-1.5px",
                        lineHeight: 1.1, marginBottom: 8,
                        fontFamily: "'Clash Display', sans-serif",
                    }}>
                        Good morning,{" "}
                        <span style={{ color: P.violetLight }}>
              {user?.name?.split(" ")[0]}
            </span>{" "}👋
                    </h1>
                    <p style={{ color: P.muted, fontSize: 14 }}>
                        {stats?.totalNotes > 0
                            ? `You have ${stats.totalNotes} notes ready to review`
                            : "Upload your first slides to get started"}
                    </p>
                </div>
                <button className="btn-hover" onClick={() => navigate("/upload")}
                        style={{
                            padding: "11px 22px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}90)`,
                            color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                            boxShadow: `0 4px 20px ${P.violet}40`,
                        }}>
                    + New Note
                </button>
            </div>

            {/* Stats */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16, marginBottom: 24,
            }}>
                <StatCard icon="📚" label="Notes Generated"
                          value={loading ? "..." : stats?.totalNotes ?? 0}
                          color={P.violet} />
                <StatCard icon="⚡" label="Sessions Done"
                          value={loading ? "..." : stats?.totalSessions ?? 0}
                          color={P.cyan} />
                <StatCard icon="🔥" label="Study Streak"
                          value={`${user?.studyStreak ?? 0}d`}
                          color={P.rose} />
                <StatCard icon="🏆" label="Avg. Score"
                          value={loading ? "..." : `${stats?.avgScore ?? 0}%`}
                          color={P.emerald} trend={stats?.avgScore > 70 ? "Good" : null} />
            </div>

            {/* Main Grid */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 300px",
                gap: 20,
            }}>
                {/* Recent Notes */}
                <div style={{ gridColumn: "1 / 3" }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 14,
                    }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>Recent Notes</span>
                        <button onClick={() => navigate("/notes")}
                                style={{
                                    fontSize: 12, color: P.violet, background: "none",
                                    border: "none", cursor: "pointer", fontWeight: 600,
                                }}>
                            View all →
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="shimmer"
                                     style={{ height: 130, borderRadius: 16 }} />
                            ))}
                        </div>
                    ) : notes.length === 0 ? (
                        <div style={{
                            background: P.card, border: `2px dashed ${P.border}`,
                            borderRadius: 20, padding: "50px 30px", textAlign: "center",
                        }}>
                            <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>No notes yet</div>
                            <div style={{ color: P.muted, fontSize: 13, marginBottom: 18 }}>
                                Upload your first slides and AI will generate everything
                            </div>
                            <button className="btn-hover" onClick={() => navigate("/upload")}
                                    style={{
                                        padding: "10px 22px", borderRadius: 10, border: "none",
                                        background: P.violet, color: "#fff", cursor: "pointer", fontWeight: 700,
                                    }}>
                                Upload Now →
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {notes.map(note => (
                                <div key={note._id} className="card-hover"
                                     onClick={() => navigate(`/notes/${note._id}`)}
                                     style={{
                                         background: P.card, border: `1px solid ${P.border}`,
                                         borderRadius: 16, padding: 18, cursor: "pointer",
                                         position: "relative", overflow: "hidden",
                                     }}>
                                    <div style={{
                                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                        background: `linear-gradient(90deg, ${note.color || P.violet}, transparent)`,
                                    }} />

                                    {note.status === "processing" && (
                                        <div style={{
                                            position: "absolute", top: 10, right: 10,
                                            fontSize: 9, background: `${P.amber}20`, color: P.amber,
                                            padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                                        }}>⏳ Processing</div>
                                    )}

                                    <div style={{ fontSize: 28, marginBottom: 10 }}>
                                        {note.icon || "📝"}
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                                        {note.title}
                                    </div>
                                    <div style={{ marginBottom: 10 }}>
                                        <Badge color={note.color || P.violet}>{note.subject}</Badge>
                                    </div>
                                    <div style={{
                                        height: 3, background: P.border, borderRadius: 4, marginBottom: 4,
                                    }}>
                                        <div style={{
                                            height: "100%", width: `${note.masteryLevel || 0}%`,
                                            background: note.color || P.violet, borderRadius: 4,
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: P.muted }}>
                                        {note.masteryLevel || 0}% mastered
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <PomodoroWidget />
                    <ExamCountdown />

                    {/* Quick Actions */}
                    <div style={{
                        background: P.card, border: `1px solid ${P.border}`,
                        borderRadius: 16, padding: 16,
                    }}>
                        <div style={{
                            fontSize: 11, color: P.muted, fontWeight: 700,
                            letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
                        }}>Quick Actions</div>
                        {[
                            { label: "🧠 View Mind Maps",   path: "/mindmap",   color: P.violet },
                            { label: "⚡ Start Revision",    path: "/revision",  color: P.cyan },
                            { label: "📊 View Analytics",    path: "/analytics", color: P.emerald },
                            { label: "👥 Study Rooms",       path: "/rooms",     color: P.rose },
                        ].map(a => (
                            <button key={a.path} onClick={() => navigate(a.path)}
                                    style={{
                                        display: "block", width: "100%", textAlign: "left",
                                        padding: "9px 12px", borderRadius: 10, border: "none",
                                        background: "transparent", color: P.muted,
                                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                                        marginBottom: 4, transition: "all 0.2s",
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = `${a.color}15`;
                                        e.target.style.color = a.color;
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = "transparent";
                                        e.target.style.color = P.muted;
                                    }}>
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
