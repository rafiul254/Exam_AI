import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const P = {
    bg: "#080812", surface: "#0f0f1a", card: "#13131f",
    border: "#1e1e35", violet: "#7c3aed", violetLight: "#a78bfa",
    cyan: "#06b6d4", text: "#f1f0ff", muted: "#6b6b9a",
};

export default function ResetPassword() {
    const { token }   = useParams();
    const navigate    = useNavigate();
    const [password, setPassword]   = useState("");
    const [confirm, setConfirm]     = useState("");
    const [loading, setLoading]     = useState(false);
    const [done, setDone]           = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirm) return toast.error("Fill in all fields");
        if (password !== confirm)  return toast.error("Passwords don't match");
        if (password.length < 6)   return toast.error("Password must be 6+ characters");

        setLoading(true);
        try {
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setDone(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            toast.error(err.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: P.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cabinet Grotesk', sans-serif",
        }}>
            <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                        fontSize: 26, fontWeight: 900,
                        fontFamily: "'Clash Display', sans-serif",
                    }}>
                        Exam<span style={{ color: P.violetLight }}>AI</span>
                    </div>
                </div>
                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 20, padding: 28,
                }}>
                    {done ? (
                        <div style={{ textAlign: "center", padding: "16px 0" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                                Password reset!
                            </div>
                            <div style={{ color: P.muted, fontSize: 13 }}>
                                Redirecting to login...
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                fontWeight: 800, fontSize: 18, marginBottom: 6,
                            }}>Set new password</div>
                            <div style={{
                                color: P.muted, fontSize: 13, marginBottom: 24,
                            }}>Choose a strong password for your account</div>

                            <form onSubmit={handleSubmit}>
                                {[
                                    { label: "New Password",     val: password, set: setPassword },
                                    { label: "Confirm Password", val: confirm,  set: setConfirm },
                                ].map(f => (
                                    <div key={f.label} style={{ marginBottom: 16 }}>
                                        <label style={{
                                            fontSize: 11, color: P.muted, display: "block",
                                            marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                                            textTransform: "uppercase",
                                        }}>{f.label}</label>
                                        <input type="password" value={f.val}
                                               onChange={e => f.set(e.target.value)}
                                               placeholder="••••••••"
                                               style={{
                                                   width: "100%", padding: "12px 14px", borderRadius: 12,
                                                   border: `1px solid ${P.border}`,
                                                   background: P.surface, color: P.text,
                                                   fontSize: 14, outline: "none",
                                               }}
                                        />
                                    </div>
                                ))}
                                <button type="submit" disabled={loading}
                                        style={{
                                            width: "100%", padding: "13px", borderRadius: 12,
                                            border: "none", cursor: "pointer", fontWeight: 700,
                                            fontSize: 15, color: "#fff", marginTop: 8,
                                            background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}90)`,
                                            boxShadow: `0 4px 20px ${P.violet}40`,
                                            opacity: loading ? 0.7 : 1,
                                        }}>
                                    {loading ? "Saving..." : "Save New Password →"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
