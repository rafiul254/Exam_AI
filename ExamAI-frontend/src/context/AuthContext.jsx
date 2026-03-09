import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("examai_token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            axios.get("/api/auth/me")
                .then(r => setUser(r.data))
                .catch(() => localStorage.removeItem("examai_token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const saveAuth = (token, userData) => {
        localStorage.setItem("examai_token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(userData);
    };

    const login = async (email, password) => {
        const r = await axios.post("/api/auth/login", { email, password });
        saveAuth(r.data.token, r.data.user);
    };

    const register = async (name, email, password) => {
        const r = await axios.post("/api/auth/register", { name, email, password });
        saveAuth(r.data.token, r.data.user);
    };

    const googleLogin = async (credential) => {
        const r = await axios.post("/api/auth/google", { credential });
        saveAuth(r.data.token, r.data.user);
    };

    const logout = () => {
        localStorage.removeItem("examai_token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
