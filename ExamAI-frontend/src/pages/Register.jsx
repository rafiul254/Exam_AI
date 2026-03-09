import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const P = {
    bg: "#080812", surface: "#0f0f1a", card: "#13131f",
    border: "#1e1e35", violet: "#7c3aed", violetLight: "#a78bfa",
    cyan: "#06b6d4", text: "#f1f0ff", muted: "#6b6b9a",
};

export default function Register() {
    const [name, setName]       = useState("");
    const [email, setEmail]     = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate  = useNavigate();
    const googleBtn = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => {
            if (!window.google || !googleBtn.current) return;
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(googleBtn.current, {
                theme: "filled_black", size: "large",
                width: "100%", text: "signup_with", shape: "rectangular",
            });
        };
        document.head.appendChild(script);
        return () => document.head.removeChild(script);
    }, []);

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            await googleLogin(response.credential);
            toast.success("Account created!");
            navigate("/dashboard");
        } catch (err) {
            toast.error("Google signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return toast.error("Fill in all fields");
        if (password.length < 6) return toast.error("Password must be 6+ characters");
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success("Account created! 🎉");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
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
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #13131f inset !important;
          -webkit-text-fill-color: #f1f0ff !important;
        }
      `}</style>

            <div style={{
                position: "fixed", top: "-15%", right: "-5%",
                width: 500, height: 500, borderRadius: "50%",
                background: `radial-gradient(circle, ${P.violet}15 0%, transparent 70%)`,
                filter: "blur(40px)", pointerEvents: "none",
            }} />

            <div style={{
                width: "100%", maxWidth: 420, padding: 24,
                animation: "fadeUp 0.4s ease forwards",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                        fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px",
                        fontFamily: "'Clash Display', sans-serif",
                    }}>
                        Exam<span style={{ color: P.violetLight }}>AI</span>
                    </div>
                    <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>
                        Create your free account
                    </div>
                </div>

                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 22, padding: 28,
                }}>
                    {/* Google */}
                    <div style={{ marginBottom: 20 }}>
                        <div ref={googleBtn} style={{ width: "100%" }} />
                    </div>

                    <div style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
                    }}>
                        <div style={{ flex: 1, height: 1, background: P.border }} />
                        <span style={{ fontSize: 11, color: P.muted }}>or with email</span>
                        <div style={{ flex: 1, height: 1, background: P.border }} />
                    </div>

                    <form onSubmit={handleRegister}>
                        {[
                            { label: "Full Name",  type: "text",     val: name,     set: setName,     placeholder: "Your name" },
                            { label: "Email",      type: "email",    val: email,    set: setEmail,    placeholder: "you@example.com" },
                            { label: "Password",   type: "password", val: password, set: setPassword, placeholder: "6+ characters" },
                        ].map(f => (
                            <div key={f.label} style={{ marginBottom: 16 }}>
                                <label style={{
                                    fontSize: 11, color: P.muted, display: "block",
                                    marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                                    textTransform: "uppercase",
                                }}>{f.label}</label>
                                <input
                                    type={f.type} value={f.val}
                                    onChange={e => f.set(e.target.value)}
                                    placeholder={f.placeholder}
                                    style={{
                                        width: "100%", padding: "12px 14px", borderRadius: 12,
                                        border: `1px solid ${P.border}`,
                                        background: P.surface, color: P.text,
                                        fontSize: 14, outline: "none",
                                    }}
                                    onFocus={e => e.target.style.borderColor = P.violet}
                                    onBlur={e => e.target.style.borderColor = P.border}
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
                            {loading ? "Creating account..." : "Create Account →"}
                        </button>
                    </form>
                </div>

                <div style={{
                    textAlign: "center", marginTop: 20,
                    fontSize: 13, color: P.muted,
                }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: P.violetLight, fontWeight: 700 }}>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
