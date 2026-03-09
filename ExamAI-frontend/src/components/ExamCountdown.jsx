import { useState, useEffect } from "react";

const P = {
    card: "#13131f", border: "#1e1e35",
    rose: "#f43f5e", muted: "#6b6b9a", text: "#f1f0ff",
};

export default function ExamCountdown() {
    const [examDate, setExamDate] = useState(
        () => localStorage.getItem("examai_exam_date") || ""
    );
    const [editing, setEditing] = useState(false);
    const [now, setNow]         = useState(Date.now());

    // Tick every second
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const saveDate = (val) => {
        localStorage.setItem("examai_exam_date", val);
        setExamDate(val);
        setEditing(false);
    };

    // Calculate diff
    const target  = examDate ? new Date(examDate).getTime() : 0;
    const diff    = target - now;
    const expired = diff <= 0;

    const days  = expired ? 0 : Math.floor(diff / 86400000);
    const hours = expired ? 0 : Math.floor((diff % 86400000) / 3600000);
    const mins  = expired ? 0 : Math.floor((diff % 3600000) / 60000);
    const secs  = expired ? 0 : Math.floor((diff % 60000) / 1000);

    return (
        <div style={{
            background: `linear-gradient(135deg, ${P.rose}12, ${P.card})`,
            border: `1px solid ${P.rose}30`,
            borderRadius: 20, padding: 22,
        }}>
            {/* Header */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
            }}>
                <div style={{
                    fontSize: 11, color: P.rose, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase",
                }}>📅 Exam Countdown</div>
                <button onClick={() => setEditing(!editing)}
                        style={{
                            background: "none", border: "none",
                            color: P.muted, cursor: "pointer", fontSize: 13,
                        }}>
                    {editing ? "✕" : "✎"}
                </button>
            </div>

            {/* Edit date */}
            {editing && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: P.muted, marginBottom: 6 }}>
                        Set exam date:
                    </div>
                    <input type="date"
                           min={new Date().toISOString().split("T")[0]}
                           defaultValue={examDate}
                           onChange={e => {
                               if (e.target.value) saveDate(e.target.value);
                           }}
                           style={{
                               width: "100%", padding: "10px 12px", borderRadius: 10,
                               border: `1px solid ${P.border}`, background: "#16162a",
                               color: P.text, fontSize: 14, outline: "none",
                           }}
                    />
                </div>
            )}

            {/* Countdown display */}
            {!examDate ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ color: P.muted, fontSize: 13, marginBottom: 10 }}>
                        No exam date set
                    </div>
                    <button onClick={() => setEditing(true)}
                            style={{
                                padding: "8px 16px", borderRadius: 8,
                                border: `1px solid ${P.rose}40`,
                                background: `${P.rose}15`, color: P.rose,
                                cursor: "pointer", fontSize: 12, fontWeight: 700,
                            }}>
                        + Set Exam Date
                    </button>
                </div>
            ) : expired ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
                    <div style={{ color: P.rose, fontWeight: 700 }}>Exam day!</div>
                </div>
            ) : (
                <div>
                    {/* Timer boxes */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 8, marginBottom: 12,
                    }}>
                        {[
                            { val: days,  label: "Days" },
                            { val: hours, label: "Hrs" },
                            { val: mins,  label: "Min" },
                            { val: secs,  label: "Sec" },
                        ].map(u => (
                            <div key={u.label} style={{
                                textAlign: "center",
                                background: P.card, borderRadius: 10, padding: "10px 4px",
                                border: `1px solid ${P.rose}20`,
                            }}>
                                <div style={{
                                    fontSize: u.label === "Days" ? 22 : 20,
                                    fontWeight: 900, color: P.rose,
                                    fontFamily: "'Cabinet Grotesk', sans-serif",
                                    fontVariantNumeric: "tabular-nums",
                                    minWidth: 32, display: "inline-block",
                                }}>
                                    {String(u.val).padStart(2, "0")}
                                </div>
                                <div style={{
                                    fontSize: 9, color: P.muted,
                                    textTransform: "uppercase", letterSpacing: 1,
                                }}>{u.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Exam date display */}
                    <div style={{
                        fontSize: 11, color: P.muted,
                        textAlign: "center",
                    }}>
                        {new Date(examDate).toLocaleDateString("en-US", {
                            weekday: "long", month: "long",
                            day: "numeric", year: "numeric",
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
