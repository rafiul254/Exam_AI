import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const P = {
    bg: "#080812", surface: "#0f0f1a", card: "#13131f",
    border: "#1e1e35", violet: "#7c3aed", violetLight: "#a78bfa",
    cyan: "#06b6d4", text: "#f1f0ff", muted: "#6b6b9a",
};

export default function Login() {
    const [tab, setTab]         = useState("login"); // login | forgot
    const [email, setEmail]     = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const googleBtn = useRef(null);

    // Load Google Identity Services
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = initGoogle;
        document.head.appendChild(script);
        return () => document.head.removeChild(script);
    }, [tab]);

    const initGoogle = () => {
        if (!window.google || !googleBtn.current) return;
        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(googleBtn.current, {
            theme: "filled_black",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
        });
    };

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            await googleLogin(response.credential);
            toast.success("Welcome!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Fill in all fields");
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Enter your email");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            await res.json();
            setResetSent(true);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: P.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cabinet Grotesk', sans-serif", position: "relative",
            overflow: "hidden",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #13131f inset !important;
          -webkit-text-fill-color: #f1f0ff !important;
        }
      `}</style>

            {/* Background orbs */}
            <div style={{
                position: "absolute", top: "-15%", left: "-10%",
                width: 500, height: 500, borderRadius: "50%",
                background: `radial-gradient(circle, ${P.violet}18 0%, transparent 70%)`,
                filter: "blur(40px)", pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", bottom: "-10%", right: "-10%",
                width: 400, height: 400, borderRadius: "50%",
                background: `radial-gradient(circle, ${P.cyan}12 0%, transparent 70%)`,
                filter: "blur(40px)", pointerEvents: "none",
            }} />

            {/* Card */}
            <div style={{
                width: "100%", maxWidth: 420, padding: 24,
                animation: "fadeUp 0.4s ease forwards",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: P.violet, margin: "0 auto 14px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, boxShadow: `0 0 28px ${P.violet}60`,
                        animation: "float 4s ease-in-out infinite",
                    }}>✦</div>
                    <div style={{
                        fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px",
                        fontFamily: "'Clash Display', sans-serif",
                    }}>
                        Exam<span style={{ color: P.violetLight }}>AI</span>
                    </div>
                    <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>
                        {tab === "forgot" ? "Reset your password" : "Sign in to continue"}
                    </div>
                </div>

                <div style={{
                    background: P.card, border: `1px solid ${P.border}`,
                    borderRadius: 22, padding: 28,
                }}>

                    {/* FORGOT PASSWORD VIEW */}
                    {tab === "forgot" ? (
                        resetSent ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
                                    Check your email
                                </div>
                                <div style={{ color: P.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                                    If <span style={{ color: P.violetLight }}>{email}</span> is registered,
                                    you'll receive a reset link shortly.
                                </div>
                                <button onClick={() => { setTab("login"); setResetSent(false); }}
                                        style={{
                                            padding: "10px 24px", borderRadius: 10, border: "none",
                                            background: P.violet, color: "#fff",
                                            cursor: "pointer", fontWeight: 700,
                                        }}>
                                    Back to Login
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgot}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{
                                        fontSize: 11, color: P.muted, display: "block",
                                        marginBottom: 6, fontWeight: 700, letterSpacing: 1,
                                        textTransform: "uppercase",
                                    }}>Email</label>
                                    <input
                                        type="email" value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        style={{
                                            width: "100%", padding: "12px 14px", borderRadius: 12,
                                            border: `1px solid ${P.border}`, background: P.surface,
                                            color: P.text, fontSize: 14, outline: "none",
                                        }}
                                    />
                                </div>
                                <button type="submit" disabled={loading}
                                        style={{
                                            width: "100%", padding: "13px", borderRadius: 12,
                                            border: "none", cursor: "pointer", fontWeight: 700,
                                            fontSize: 15, color: "#fff",
                                            background: `linear-gradient(135deg, ${P.violet}, ${P.cyan}90)`,
                                            opacity: loading ? 0.7 : 1,
                                            boxShadow: `0 4px 20px ${P.violet}40`,
                                        }}>
                                    {loading ? "Sending..." : "Send Reset Link →"}
                                </button>
                                <button type="button" onClick={() => setTab("login")}
                                        style={{
                                            width: "100%", marginTop: 12, padding: "10px",
                                            background: "none", border: "none",
                                            color: P.muted, cursor: "pointer", fontSize: 13,
                                        }}>← Back to Login</button>
                            </form>
                        )
                    ) : (
                        /* LOGIN VIEW */
                        <>
                            {/* Google Button */}
                            <div style={{ marginBottom: 20 }}>
                                <div ref={googleBtn} style={{ width: "100%" }} />
                            </div>

                            {/* Divider */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                marginBottom: 20,
                            }}>
                                <div style={{ flex: 1, height: 1, background: P.border }} />
                                <span style={{ fontSize: 11, color: P.muted }}>or continue with email</span>
                                <div style={{ flex: 1, height: 1, background: P.border }} />
                            </div>

                            {/* Email/Password Form */}
                            <form onSubmit={handleLogin}>
                                {[
                                    { label: "Email", type: "email", val: email, set: setEmail, placeholder: "you@example.com" },
                                    { label: "Password", type: "password", val: password, set: setPassword, placeholder: "••••••••" },
                                ].map(f => (
                                    <div key={f.label} style={{ marginBottom: 16 }}>
                                        <div style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", marginBottom: 6,
                                        }}>
                                            <label style={{
                                                fontSize: 11, color: P.muted, fontWeight: 700,
                                                letterSpacing: 1, textTransform: "uppercase",
                                            }}>{f.label}</label>
                                            {f.label === "Password" && (
                                                <button type="button"
                                                        onClick={() => setTab("forgot")}
                                                        style={{
                                                            fontSize: 11, color: P.violetLight,
                                                            background: "none", border: "none",
                                                            cursor: "pointer", fontWeight: 600,
                                                        }}>
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type={f.type} value={f.val}
                                            onChange={e => f.set(e.target.value)}
                                            placeholder={f.placeholder}
                                            style={{
                                                width: "100%", padding: "12px 14px", borderRadius: 12,
                                                border: `1px solid ${P.border}`,
                                                background: P.surface, color: P.text,
                                                fontSize: 14, outline: "none", transition: "border 0.2s",
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
                                            opacity: loading ? 0.7 : 1, transition: "all 0.2s",
                                        }}>
                                    {loading ? "Signing in..." : "Login →"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {tab === "login" && (
                    <div style={{
                        textAlign: "center", marginTop: 20,
                        fontSize: 13, color: P.muted,
                    }}>
                        No account?{" "}
                        <Link to="/register" style={{ color: P.violetLight, fontWeight: 700 }}>
                            Register free
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
