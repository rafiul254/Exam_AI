import { useState } from "react";
import toast from "react-hot-toast";

const P = {
    card: "#13131f", border: "#1e1e35", surface: "#0f0f1a",
    violet: "#7c3aed", cyan: "#06b6d4",
    amber: "#f59e0b", emerald: "#10b981", rose: "#f43f5e",
    text: "#f1f0ff", muted: "#6b6b9a",
};

const COLORS = [P.cyan, P.emerald, P.amber, P.rose, P.violet];

const demoRooms = [
    { id: 1, name: "CSE Study Group", topic: "Data Structures", members: 4, active: true,  subject: "CS" },
    { id: 2, name: "Bio Revision",    topic: "Cell Division",   members: 2, active: true,  subject: "Biology" },
    { id: 3, name: "Math Help",       topic: "Integration",     members: 6, active: false, subject: "Math" },
    { id: 4, name: "History Club",    topic: "World War II",    members: 3, active: false, subject: "History" },
    { id: 5, name: "Physics Group",   topic: "Quantum Theory",  members: 1, active: true,  subject: "Physics" },
];

export default function StudyRooms() {
    const [rooms, setRooms]       = useState(demoRooms);
    const [creating, setCreating] = useState(false);
    const [form, setForm]         = useState({ name: "", topic: "", subject: "General" });
    const [activeRoom, setActiveRoom] = useState(null);
    const [message, setMessage]   = useState("");
    const [messages, setMessages] = useState([
        { user: "Alex",  text: "Has anyone solved problem 3?", time: "10:22" },
        { user: "Sarah", text: "Yes! You need to use dynamic programming", time: "10:23" },
        { user: "You",   text: "Thanks! Let me try", time: "10:24" },
    ]);

    const handleCreate = () => {
        if (!form.name || !form.topic) {
            toast.error("Fill in room name and topic");
            return;
        }
        const newRoom = {
            id: Date.now(), ...form,
            members: 1, active: true,
        };
        setRooms([newRoom, ...rooms]);
        setCreating(false);
        setForm({ name: "", topic: "", subject: "General" });
        toast.success("Room created!");
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        setMessages([...messages, {
            user: "You", text: message,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }]);
        setMessage("");
    };

    // ── Room Chat View ────────────────────────────────────────
    if (activeRoom) {
        const room = rooms.find(r => r.id === activeRoom);
        const color = COLORS[rooms.indexOf(room) % COLORS.length];
        return (
            <div className="animate-in" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
                {/* Chat header */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", background: P.card,
                    borderRadius: "18px 18px 0 0", border: `1px solid ${P.border}`,
                    borderBottom: "none",
                }}>
                    <button onClick={() => setActiveRoom(null)}
                            style={{
                                padding: "7px 14px", borderRadius: 8,
                                border: `1px solid ${P.border}`, background: "transparent",
                                color: P.muted, cursor: "pointer", fontSize: 12,
                            }}>← Leave</button>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{room.name}</div>
                        <div style={{ fontSize: 11, color }}>
                            {room.topic} • {room.members} members
                        </div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: P.emerald, boxShadow: `0 0 6px ${P.emerald}`,
                            animation: "pulse 2s ease-in-out infinite",
                        }} />
                        <span style={{ fontSize: 11, color: P.emerald }}>LIVE</span>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1, padding: "20px", background: P.surface,
                    overflowY: "auto", border: `1px solid ${P.border}`,
                    borderTop: "none", borderBottom: "none",
                    display: "flex", flexDirection: "column", gap: 12,
                }}>
                    {messages.map((m, i) => {
                        const isMe = m.user === "You";
                        return (
                            <div key={i} style={{
                                display: "flex", gap: 10, flexDirection: isMe ? "row-reverse" : "row",
                                alignItems: "flex-end",
                            }}>
                                {!isMe && (
                                    <div style={{
                                        width: 30, height: 30, borderRadius: "50%",
                                        background: `${color}30`, border: `1px solid ${color}50`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, fontWeight: 700, color, flexShrink: 0,
                                    }}>{m.user[0]}</div>
                                )}
                                <div style={{ maxWidth: "65%" }}>
                                    {!isMe && (
                                        <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>
                                            {m.user}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: "10px 14px", borderRadius: isMe
                                            ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                                        background: isMe ? `${P.violet}25` : P.card,
                                        border: `1px solid ${isMe ? P.violet + "40" : P.border}`,
                                        fontSize: 13, lineHeight: 1.5,
                                    }}>{m.text}</div>
                                    <div style={{
                                        fontSize: 9, color: P.muted,
                                        marginTop: 4, textAlign: isMe ? "right" : "left",
                                    }}>{m.time}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input */}
                <div style={{
                    display: "flex", gap: 10, padding: "16px 20px",
                    background: P.card, borderRadius: "0 0 18px 18px",
                    border: `1px solid ${P.border}`, borderTop: "none",
                }}>
                    <input
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        style={{
                            flex: 1, padding: "10px 14px", borderRadius: 12,
                            border: `1px solid ${P.border}`, background: P.surface,
                            color: P.text, fontSize: 13, outline: "none",
                        }}
                    />
                    <button onClick={sendMessage}
                            style={{
                                padding: "10px 20px", borderRadius: 12, border: "none",
                                background: P.violet, color: "#fff",
                                cursor: "pointer", fontWeight: 700,
                            }}>Send →</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 28,
            }}>
                <div>
                    <div style={{
                        fontSize: 10, color: P.violet, fontWeight: 700,
                        letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
                    }}>👥 Collaborative</div>
                    <h1 style={{
                        fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
                        fontFamily: "'Clash Display', sans-serif", marginBottom: 6,
                    }}>Study Rooms</h1>
                    <p style={{ color: P.muted, fontSize: 14 }}>
                        Study together, learn faster
                    </p>
                </div>
                <button className="btn-hover"
                        onClick={() => setCreating(!creating)}
                        style={{
                            padding: "10px 20px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}90)`,
                            color: "#fff", cursor: "pointer", fontWeight: 700,
                            boxShadow: `0 4px 16px ${P.violet}40`,
                        }}>
                    + Create Room
                </button>
            </div>

            {/* Create Room Form */}
            {creating && (
                <div className="animate-in" style={{
                    background: P.card, border: `1px solid ${P.violet}40`,
                    borderRadius: 18, padding: 24, marginBottom: 24,
                }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>
                        Create New Room
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14,
                        marginBottom: 18,
                    }}>
                        {[
                            { label: "Room Name", key: "name", placeholder: "e.g. Physics Study Group" },
                            { label: "Topic", key: "topic", placeholder: "e.g. Newton's Laws" },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{
                                    fontSize: 11, color: P.muted, display: "block",
                                    marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                                    textTransform: "uppercase",
                                }}>{f.label}</label>
                                <input
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: `1px solid ${P.border}`, background: P.surface,
                                        color: P.text, fontSize: 13, outline: "none",
                                    }}
                                />
                            </div>
                        ))}
                        <div>
                            <label style={{
                                fontSize: 11, color: P.muted, display: "block",
                                marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                                textTransform: "uppercase",
                            }}>Subject</label>
                            <select value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: 10,
                                        border: `1px solid ${P.border}`, background: P.surface,
                                        color: P.text, fontSize: 13, outline: "none",
                                    }}>
                                {["General","Biology","Physics","Math","CS","History"].map(s => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-hover" onClick={handleCreate}
                                style={{
                                    padding: "10px 24px", borderRadius: 10, border: "none",
                                    background: P.violet, color: "#fff",
                                    cursor: "pointer", fontWeight: 700,
                                }}>Create Room</button>
                        <button onClick={() => setCreating(false)}
                                style={{
                                    padding: "10px 20px", borderRadius: 10,
                                    border: `1px solid ${P.border}`, background: "transparent",
                                    color: P.muted, cursor: "pointer",
                                }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Live Rooms */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    fontSize: 12, color: P.emerald, fontWeight: 700,
                    letterSpacing: 2, textTransform: "uppercase", marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: P.emerald,
                        boxShadow: `0 0 8px ${P.emerald}`,
                        animation: "pulse 2s ease-in-out infinite",
                    }} />
                    Live Now
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                }}>
                    {rooms.filter(r => r.active).map((room, i) => {
                        const color = COLORS[i % COLORS.length];
                        return (
                            <div key={room.id} className="card-hover"
                                 style={{
                                     background: P.card,
                                     border: `1px solid ${color}35`,
                                     borderRadius: 18, padding: 22,
                                     position: "relative", overflow: "hidden",
                                 }}>
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                    background: `linear-gradient(90deg, ${color}, transparent)`,
                                }} />
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "flex-start", marginBottom: 14,
                                }}>
                  <span style={{
                      fontSize: 10, background: `${color}20`, color,
                      padding: "3px 10px", borderRadius: 8, fontWeight: 700,
                      border: `1px solid ${color}30`,
                  }}>{room.topic}</span>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 4,
                                        fontSize: 10, color: P.emerald,
                                    }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: "50%",
                                            background: P.emerald,
                                            animation: "pulse 2s ease-in-out infinite",
                                        }} />
                                        LIVE
                                    </div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                                    {room.name}
                                </div>
                                <div style={{
                                    display: "flex", gap: 6, marginBottom: 16,
                                    alignItems: "center",
                                }}>
                                    {Array.from({ length: Math.min(room.members, 4) }).map((_, j) => (
                                        <div key={j} style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: `linear-gradient(135deg, ${color}, ${color}60)`,
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center", fontSize: 11,
                                            fontWeight: 700, color: "#fff",
                                        }}>{String.fromCharCode(65 + j)}</div>
                                    ))}
                                    <span style={{ fontSize: 11, color: P.muted }}>
                    {room.members} studying
                  </span>
                                </div>
                                <button className="btn-hover"
                                        onClick={() => setActiveRoom(room.id)}
                                        style={{
                                            width: "100%", padding: "10px", borderRadius: 10,
                                            border: "none", cursor: "pointer", fontWeight: 700,
                                            fontSize: 13, color: "#fff",
                                            background: `linear-gradient(135deg, ${color}, ${color}80)`,
                                            boxShadow: `0 4px 14px ${color}40`,
                                        }}>
                                    Join Room →
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Offline Rooms */}
            {rooms.filter(r => !r.active).length > 0 && (
                <div>
                    <div style={{
                        fontSize: 12, color: P.muted, fontWeight: 700,
                        letterSpacing: 2, textTransform: "uppercase", marginBottom: 14,
                    }}>Other Rooms</div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 14,
                    }}>
                        {rooms.filter(r => !r.active).map((room, i) => (
                            <div key={room.id} className="card-hover"
                                 style={{
                                     background: P.card,
                                     border: `1px solid ${P.border}`,
                                     borderRadius: 16, padding: 20, opacity: 0.75,
                                 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                    {room.name}
                                </div>
                                <div style={{ fontSize: 12, color: P.muted, marginBottom: 14 }}>
                                    {room.topic} • {room.members} members
                                </div>
                                <button className="btn-hover"
                                        onClick={() => {
                                            setRooms(rooms.map(r =>
                                                r.id === room.id ? { ...r, active: true } : r
                                            ));
                                            toast.success("Room started!");
                                        }}
                                        style={{
                                            width: "100%", padding: "9px", borderRadius: 10,
                                            border: `1px solid ${P.border}`, background: "transparent",
                                            color: P.muted, cursor: "pointer", fontSize: 12, fontWeight: 600,
                                        }}>
                                    Start Room
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
