const P = {
    card: "#13131f", border: "#1e1e35", muted: "#6b6b9a", text: "#f1f0ff",
};

export default function StatCard({ icon, label, value, color, trend }) {
    return (
        <div className="card-hover" style={{
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: 16, padding: "18px 20px",
            position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            }} />
            <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
            <div style={{
                fontSize: 28, fontWeight: 900, color,
                fontFamily: "'Cabinet Grotesk', sans-serif",
            }}>{value}</div>
            <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>{label}</div>
            {trend && (
                <div style={{
                    position: "absolute", top: 16, right: 14,
                    fontSize: 10, color: "#10b981", fontWeight: 700,
                }}>↑ {trend}</div>
            )}
        </div>
    );
}
