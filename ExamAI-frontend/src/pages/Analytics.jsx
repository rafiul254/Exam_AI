import { useState, useEffect } from "react";
import { notesAPI, revisionAPI } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

export default function Analytics() {
    const [stats, setStats]   = useState(null);
    const [notes, setNotes]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([revisionAPI.stats(), notesAPI.getAll()])
            .then(([s, n]) => {
                setStats(s.data);
                setNotes(n.data);
                setLoading(false);
            });
    }, []);

    const weekData = [
        { day: "Mon", val: 45 }, { day: "Tue", val: 72 },
        { day: "Wed", val: 38 }, { day: "Thu", val: 90 },
        { day: "Fri", val: 65 }, { day: "Sat", val: 88 },
        { day: "Sun", val: 55 },
    ];
    const maxVal = Math.max(...weekData.map(d => d.val));

    const subjectGroups = notes.reduce((acc, n) => {
        if (!acc[n.subject]) acc[n.subject] = { count: 0, mastery: 0 };
        acc[n.subject].count++;
        acc[n.subject].mastery += n.masteryLevel || 0;
        return acc;
    }, {});

    const subjectColors = [P.violet, P.cyan, P.emerald, P.amber, P.rose];

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    fontSize: 10, color: P.violet, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                }}>📊 Insights</div>
                <h1 style={{
                    fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                    fontFamily: "'Clash Display', sans-serif", marginBottom: 6,
                }}>Deep Analytics</h1>
                <p style={{ color: P.muted, fontSize: 14 }}>
                    Understand exactly how you're learning
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16, marginBottom: 24,
            }}>
                <StatCard icon="📚" label="Total Notes"
                          value={loading ? "..." : stats?.totalNotes ?? 0}
                          color={P.violet} />
                <StatCard icon="↻" label="Total Sessions"
                          value={loading ? "..." : stats?.totalSessions ?? 0}
                          color={P.cyan} />
                <StatCard icon="🎯" label="Avg. Score"
                          value={loading ? "..." : `${stats?.avgScore ?? 0}%`}
                          color={P.emerald} />
                <StatCard icon="⏱️" label="Study Time"
                          value="47h" color={P.amber} trend="this month" />
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
                marginBottom: 20,
            }}>
                {/* Weekly Chart */}
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 24,
                }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 20,
                    }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>
                                Weekly Study Time
                            </div>
                            <div style={{ fontSize: 12, color: P.muted }}>
                                Minutes per day
                            </div>
                        </div>
                        <div style={{
                            fontSize: 11, background: `${P.emerald}20`,
                            color: P.emerald, padding: "4px 10px", borderRadius: 8,
                            fontWeight: 700, border: `1px solid ${P.emerald}30`,
                        }}>↑ 23% this week</div>
                    </div>
                    <div style={{
                        display: "flex", alignItems: "flex-end",
                        gap: 10, height: 120,
                    }}>
                        {weekData.map(d => (
                            <div key={d.day} style={{
                                flex: 1, display: "flex",
                                flexDirection: "column", alignItems: "center", gap: 6,
                            }}>
                <span style={{ fontSize: 9, color: P.violet, fontWeight: 700 }}>
                  {d.val}
                </span>
                                <div style={{
                                    width: "100%",
                                    height: `${(d.val / maxVal) * 90}px`,
                                    background: `linear-gradient(to top, ${P.violet}, ${P.cyan}80)`,
                                    borderRadius: "6px 6px 0 0",
                                    boxShadow: `0 0 12px ${P.violet}40`,
                                    transition: "height 1s ease",
                                }} />
                                <span style={{ fontSize: 10, color: P.muted }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subject Mastery */}
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 24,
                }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 20 }}>
                        Subject Mastery
                    </div>
                    {loading ? (
                        <div style={{ color: P.muted, textAlign: "center", padding: 40 }}>
                            Loading...
                        </div>
                    ) : Object.keys(subjectGroups).length === 0 ? (
                        <div style={{ color: P.muted, textAlign: "center", padding: 40 }}>
                            No data yet
                        </div>
                    ) : (
                        Object.entries(subjectGroups).map(([subject, data], i) => {
                            const avg = Math.round(data.mastery / data.count);
                            const color = subjectColors[i % subjectColors.length];
                            return (
                                <div key={subject} style={{ marginBottom: 16 }}>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        marginBottom: 6, fontSize: 13,
                                    }}>
                                        <span>{subject}</span>
                                        <span style={{ color, fontWeight: 700 }}>{avg}%</span>
                                    </div>
                                    <div style={{ height: 6, background: P.border, borderRadius: 4 }}>
                                        <div style={{
                                            height: "100%", width: `${avg}%`,
                                            background: `linear-gradient(90deg, ${color}, ${color}70)`,
                                            borderRadius: 4,
                                            boxShadow: `0 0 8px ${color}50`,
                                            transition: "width 1s ease",
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Notes Table */}
            <div style={{
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 20, padding: 24,
            }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 20 }}>
                    All Notes Progress
                </div>
                {notes.length === 0 ? (
                    <div style={{ color: P.muted, textAlign: "center", padding: 30 }}>
                        No notes yet
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {/* Header */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr",
                            gap: 12, padding: "8px 12px",
                            fontSize: 10, color: P.muted, fontWeight: 700,
                            letterSpacing: 1, textTransform: "uppercase",
                            borderBottom: `1px solid ${P.border}`,
                        }}>
                            <span>Note</span>
                            <span>Subject</span>
                            <span>Mastery</span>
                            <span>Status</span>
                        </div>
                        {notes.map(n => (
                            <div key={n._id} style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                                gap: 12, padding: "12px",
                                borderBottom: `1px solid ${P.border}`,
                                alignItems: "center", fontSize: 13,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span>{n.icon || "📝"}</span>
                                    <span style={{ fontWeight: 700 }}>{n.title}</span>
                                </div>
                                <span style={{ color: n.color || P.violet, fontSize: 11 }}>
                  {n.subject}
                </span>
                                <div>
                                    <div style={{
                                        height: 4, background: P.border,
                                        borderRadius: 4, marginBottom: 3,
                                    }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${n.masteryLevel || 0}%`,
                                            background: n.color || P.violet,
                                            borderRadius: 4,
                                        }} />
                                    </div>
                                    <span style={{
                                        fontSize: 10, color: P.muted,
                                    }}>{n.masteryLevel || 0}%</span>
                                </div>
                                <span style={{
                                    fontSize: 10, padding: "3px 8px",
                                    borderRadius: 6, fontWeight: 700,
                                    background: n.status === "ready"
                                        ? `${P.emerald}20` : `${P.amber}20`,
                                    color: n.status === "ready" ? P.emerald : P.amber,
                                }}>{n.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
