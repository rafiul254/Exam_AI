import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login       from "./pages/Login.jsx";
import Register    from "./pages/Register.jsx";
import Dashboard   from "./pages/Dashboard.jsx";
import Notes       from "./pages/Notes.jsx";
import NoteDetail  from "./pages/NoteDetail.jsx";
import Upload      from "./pages/Upload.jsx";
import Revision    from "./pages/Revision.jsx";
import Analytics   from "./pages/Analytics.jsx";
import MindMap     from "./pages/MindMap.jsx";
import StudyRooms  from "./pages/StudyRooms.jsx";
import Layout      from "./components/Layout.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100vh", background: "#080812", color: "#7c3aed", fontSize: 18,
            fontFamily: "'Cabinet Grotesk', sans-serif",
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite",
                    display: "inline-block" }}>✦</div>
                <div>Loading...</div>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard"  element={<Dashboard />} />
                <Route path="notes"      element={<Notes />} />
                <Route path="notes/:id"  element={<NoteDetail />} />
                <Route path="upload"     element={<Upload />} />
                <Route path="revision"   element={<Revision />} />
                <Route path="analytics"  element={<Analytics />} />
                <Route path="mindmap"    element={<MindMap />} />
                <Route path="rooms"      element={<StudyRooms />} />
            </Route>
        </Routes>
    );
}
