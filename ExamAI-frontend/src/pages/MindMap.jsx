import { useState, useEffect } from "react";
import { notesAPI } from "../services/api.js";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const COLORS = [P.violet, P.cyan, P.emerald, P.amber, P.rose];

function MindMapSVG({ note, color }) {
    if (!note) return null;

    const nodes = [
        { id: 0, label: note.title, x: 300, y: 200, main: true },
        ...(note.keyPoints?.slice(0, 5) || []).map((pt, i) => {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return {
                id: i + 1,
                label: pt.slice(0, 30) + (pt.length > 30 ? "..." : ""),
                x: 300 + Math.cos(angle) * 160,
                y: 200 + Math.sin(angle) * 130,
                main: false,
            };
        }),
    ];

    return (
        <svg viewBox="0 0 600 400" style={{ width: "100%", height: 320 }}>
            {/* Connection lines */}
            {nodes.slice(1).map(n => (
                <line key={n.id}
                      x1={nodes[0].x} y1={nodes[0].y}
                      x2={n.x} y2={n.y}
                      stroke={color} strokeWidth={1.5}
                      opacity={0.35} strokeDasharray="6,4"
                />
            ))}

            {/* Nodes */}
            {nodes.map(n => (
                <g key={n.id}>
                    {n.main ? (
                        <ellipse cx={n.x} cy={n.y} rx={80} ry={30}
                                 fill={`${color}25`} stroke={color} strokeWidth={2}
                                 style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
                        />
                    ) : (
                        <rect x={n.x - 70} y={n.y - 18} width={140} height={36}
                              rx={10} fill={`${color}15`} stroke={color}
                              strokeWidth={1} opacity={0.9}
                        />
                    )}
                    <text x={n.x} y={n.y + 4} textAnchor="middle"
                          fill={color}
                          fontSize={n.main ? 11 : 9}
                          fontWeight={n.main ? 700 : 500}
                          style={{ pointerEvents: "none" }}>
                        {n.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default function MindMap() {
    const [notes, setNotes]       = useState([]);
    const [selected, setSelected] = useState(null);
    const [note, setNote]         = useState(null);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        notesAPI.getAll({ status: "ready" })
            .then(r => { setNotes(r.data); setLoading(false); });
    }, []);

    const openNote = async (n) => {
        setSelected(n._id);
        const r = await notesAPI.getOne(n._id);
        setNote(r.data);
    };

    if (loading) return (
        <div style={{ color: P.muted, padding: 40 }}>Loading...</div>
    );

    return (
        <div className="animate-in">
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    fontSize: 10, color: P.violet, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                }}>🧠 Visual Learning</div>
                <h1 style={{
                    fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                    fontFamily: "'Clash Display', sans-serif", marginBottom: 6,
                }}>Mind Maps</h1>
                <p style={{ color: P.muted, fontSize: 14 }}>
                    Visual knowledge maps — generated from your notes
                </p>
            </div>

            {notes.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px",
                    background: P.card, border: `2px dashed ${P.border}`,
                    borderRadius: 20, color: P.muted,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>No notes yet</div>
                    <div style={{ fontSize: 13 }}>Upload slides first to generate mind maps</div>
                </div>
            ) : (
                <div style={{
                    display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "1fr",
                    gap: 20,
                }}>
                    {/* Note list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {notes.map((n, i) => {
                            const color = n.color || COLORS[i % COLORS.length];
                            return (
                                <div key={n._id} className="card-hover"
                                     onClick={() => openNote(n)}
                                     style={{
                                         background: selected === n._id
                                             ? `${color}15` : P.card,
                                         border: `1px solid ${selected === n._id
                                             ? color + "50" : P.border}`,
                                         borderRadius: 14, padding: "14px 16px",
                                         cursor: "pointer", transition: "all 0.2s",
                                     }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ fontSize: 22 }}>{n.icon || "📝"}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                                            <div style={{ fontSize: 11, color }}>
                                                {n.subject} • {n.keyPoints?.length || 0} nodes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mind map display */}
                    {selected && (
                        <div className="animate-in" style={{
                            background: P.card, border: `1px solid ${P.border}`,
                            borderRadius: 20, padding: 24,
                        }}>
                            {note ? (
                                <>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center", marginBottom: 20,
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 16 }}>{note.title}</div>
                                            <div style={{
                                                fontSize: 12, color: note.color || P.violet,
                                            }}>{note.subject}</div>
                                        </div>
                                        <button onClick={() => { setSelected(null); setNote(null); }}
                                                style={{
                                                    background: "none", border: "none",
                                                    color: P.muted, cursor: "pointer", fontSize: 18,
                                                }}>✕</button>
                                    </div>

                                    {/* SVG Mind Map */}
                                    <div style={{
                                        background: P.surface, borderRadius: 16, padding: 16,
                                        marginBottom: 20,
                                    }}>
                                        <MindMapSVG note={note} color={note.color || P.violet} />
                                    </div>

                                    {/* Key points list */}
                                    <div>
                                        <div style={{
                                            fontSize: 11, color: P.muted, fontWeight: 700,
                                            letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
                                        }}>Key Nodes</div>
                                        <div style={{
                                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                                        }}>
                                            {note.keyPoints?.map((pt, i) => (
                                                <div key={i} style={{
                                                    display: "flex", gap: 10, padding: "10px 12px",
                                                    background: P.surface, borderRadius: 10,
                                                    border: `1px solid ${P.border}`,
                                                }}>
                                                    <div style={{
                                                        width: 22, height: 22, borderRadius: 6,
                                                        flexShrink: 0, fontSize: 10, fontWeight: 700,
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "center",
                                                        background: `${note.color || P.violet}20`,
                                                        color: note.color || P.violet,
                                                    }}>{i + 1}</div>
                                                    <span style={{ fontSize: 12, lineHeight: 1.5 }}>{pt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", height: 300, color: P.muted,
                                }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{
                                            fontSize: 28, animation: "spin 1s linear infinite",
                                            display: "inline-block", marginBottom: 10,
                                        }}>✦</div>
                                        <div>Loading mind map...</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
