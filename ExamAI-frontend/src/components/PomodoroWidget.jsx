import { useState, useEffect, useRef } from "react";

const P = {
    card: "#13131f", border: "#1e1e35", violet: "#7c3aed",
    emerald: "#10b981", rose: "#f43f5e", muted: "#6b6b9a", text: "#f1f0ff",
};

export default function PomodoroWidget() {
    const [time, setTime]     = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [mode, setMode]     = useState("focus");
    const ref = useRef();

    useEffect(() => {
        if (running) {
            ref.current = setInterval(() => setTime(t => t > 0 ? t - 1 : 0), 1000);
        } else {
            clearInterval(ref.current);
        }
        return () => clearInterval(ref.current);
    }, [running]);

    const switchMode = (m) => {
        setMode(m);
        setTime(m === "focus" ? 25 * 60 : 5 * 60);
        setRunning(false);
    };

    const mins = String(Math.floor(time / 60)).padStart(2, "0");
    const secs = String(time % 60).padStart(2, "0");
    const total = mode === "focus" ? 25 * 60 : 5 * 60;
    const progress = (total - time) / total;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const activeColor = mode === "focus" ? P.violet : P.emerald;

    return (
        <div style={{
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: 20, padding: 22,
        }}>
            <div style={{
                fontSize: 11, color: P.muted, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", marginBottom: 14,
            }}>🍅 Pomodoro</div>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[
                    { key: "focus", label: "🎯 Focus" },
                    { key: "break", label: "☕ Break" },
                ].map(m => (
                    <button key={m.key} onClick={() => switchMode(m.key)}
                            style={{
                                flex: 1, padding: "6px", borderRadius: 8, border: "none",
                                cursor: "pointer", fontSize: 11, fontWeight: 700,
                                background: mode === m.key ? activeColor : P.border,
                                color: mode === m.key ? "#fff" : P.muted,
                                transition: "all 0.2s",
                            }}>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Ring timer */}
            <div style={{
                display: "flex", justifyContent: "center", marginBottom: 16,
            }}>
                <div style={{ position: "relative" }}>
                    <svg width={124} height={124} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={62} cy={62} r={r} fill="none"
                                stroke={P.border} strokeWidth={6} />
                        <circle cx={62} cy={62} r={r} fill="none"
                                stroke={activeColor} strokeWidth={6}
                                strokeDasharray={`${progress * circ} ${circ}`}
                                strokeLinecap="round"
                                style={{
                                    transition: "stroke-dasharray 1s linear",
                                    filter: `drop-shadow(0 0 8px ${activeColor})`,
                                }}
                        />
                    </svg>
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <div style={{
                            fontSize: 24, fontWeight: 900,
                            fontFamily: "'Cabinet Grotesk', sans-serif",
                            color: P.text,
                        }}>{mins}:{secs}</div>
                        <div style={{
                            fontSize: 9, color: P.muted,
                            textTransform: "uppercase", letterSpacing: 1,
                        }}>{mode}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRunning(!running)}
                        style={{
                            flex: 1, padding: "10px", borderRadius: 10, border: "none",
                            background: running ? P.rose : activeColor,
                            color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
                            transition: "all 0.2s",
                        }}>
                    {running ? "⏸ Pause" : "▶ Start"}
                </button>
                <button onClick={() => { setTime(mode === "focus" ? 25*60 : 5*60); setRunning(false); }}
                        style={{
                            padding: "10px 14px", borderRadius: 10,
                            border: `1px solid ${P.border}`, background: "transparent",
                            color: P.muted, cursor: "pointer", fontSize: 13,
                        }}>↺</button>
            </div>
        </div>
    );
}
