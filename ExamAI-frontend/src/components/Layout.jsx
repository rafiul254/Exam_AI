import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const P = {
    bg: "#080812", surface: "#0f0f1a", card: "#13131f",
    border: "#1e1e35", violet: "#7c3aed", violetLight: "#a78bfa",
    cyan: "#06b6d4", emerald: "#10b981",
    text: "#f1f0ff", muted: "#6b6b9a",
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { to: "/dashboard", icon: "⬡", label: "Dashboard" },
        { to: "/notes",     icon: "◈", label: "Smart Notes" },
        { to: "/mindmap",   icon: "🧠", label: "Mind Maps" },
        { to: "/revision",  icon: "⚡", label: "Revision" },
        { to: "/analytics", icon: "📊", label: "Analytics" },
        { to: "/rooms",     icon: "👥", label: "Study Rooms", dot: true },
        { to: "/upload",    icon: "↑",  label: "Upload" },
    ];

    return (
        <div style={{
            display: "flex", minHeight: "100vh",
            background: P.bg, color: P.text,
            fontFamily: "'Cabinet Grotesk', sans-serif",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a4e; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #7c3aed33} 50%{box-shadow:0 0 40px #7c3aed66} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .animate-in { animation: fadeUp 0.4s ease forwards; }
        .card-hover { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-3px); }
        .btn-hover { transition: all 0.2s; }
        .btn-hover:hover { transform: scale(1.03); filter: brightness(1.1); }
      `}</style>

            {/* Sidebar */}
            <aside style={{
                width: 230, background: P.surface,
                borderRight: `1px solid ${P.border}`,
                display: "flex", flexDirection: "column",
                position: "fixed", height: "100vh", zIndex: 20,
            }}>
                {/* Logo */}
                <div style={{
                    padding: "22px 20px 18px",
                    borderBottom: `1px solid ${P.border}`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: P.violet, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 16, boxShadow: `0 0 20px ${P.violet}60`,
                        }}>✦</div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>
                                Exam<span style={{ color: P.violetLight }}>AI</span>
                            </div>
                            <div style={{ fontSize: 10, color: P.muted, letterSpacing: 1 }}>
                                Smart Study Platform
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{
                    padding: "14px 10px", flex: 1,
                    display: "flex", flexDirection: "column", gap: 2,
                    overflowY: "auto",
                }}>
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px", borderRadius: 12,
                            textDecoration: "none", fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                            transition: "all 0.2s",
                            background: isActive
                                ? `linear-gradient(135deg, ${P.violet}25, ${P.violet}08)`
                                : "transparent",
                            color: isActive ? P.violetLight : P.muted,
                            border: isActive ? `1px solid ${P.violet}25` : "1px solid transparent",
                        })}>
                            <span style={{ fontSize: 15 }}>{item.icon}</span>
                            {item.label}
                            {item.dot && (
                                <span style={{
                                    marginLeft: "auto", width: 7, height: 7,
                                    borderRadius: "50%", background: P.emerald,
                                    boxShadow: `0 0 6px ${P.emerald}`,
                                }} />
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ padding: "12px 10px", borderTop: `1px solid ${P.border}` }}>
                    {/* Plan bar */}
                    <div style={{
                        background: P.card, borderRadius: 12,
                        padding: "10px 12px", marginBottom: 8,
                        border: `1px solid ${P.border}`,
                    }}>
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 11, marginBottom: 6,
                        }}>
                            <span style={{ color: P.muted }}>Notes used</span>
                            <span style={{ color: P.violetLight, fontWeight: 700 }}>
                {user?.notesCount || 0}/
                                {user?.plan === "pro" ? "∞" : "5"}
              </span>
                        </div>
                        <div style={{ height: 3, background: P.border, borderRadius: 4 }}>
                            <div style={{
                                height: "100%",
                                width: `${Math.min((user?.notesCount || 0) / 5 * 100, 100)}%`,
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${P.violet}, ${P.cyan})`,
                            }} />
                        </div>
                    </div>

                    {/* User */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", padding: "8px 12px",
                        borderRadius: 12, background: P.card,
                        border: `1px solid ${P.border}`,
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
                            <div style={{ fontSize: 10, color: P.muted, textTransform: "uppercase" }}>
                                {user?.plan || "free"} plan
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate("/login"); }}
                                style={{
                                    background: "none", border: "none",
                                    color: P.muted, cursor: "pointer", fontSize: 16,
                                }}>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{
                marginLeft: 230, flex: 1,
                padding: "32px 36px", minHeight: "100vh",
            }}>
                <Outlet />
            </main>
        </div>
    );
}
