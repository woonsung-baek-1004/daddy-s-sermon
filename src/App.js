// src/App.js — Firebase 인증 연결 메인 래퍼
import { useAuth } from "./useAuth";
import LoginScreen from "./LoginScreen";
import SermonApp   from "./SermonApp";

export default function App() {
  const { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();

  const handleLogin = async ({ mode, email, password, name, role }) => {
    if (mode === "google")   return loginWithGoogle();
    if (mode === "login")    return loginWithEmail(email, password);
    if (mode === "register") return registerWithEmail(email, password, name, role);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#faf7f2", flexDirection: "column", gap: 16,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        <div style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 28, fontWeight: 900, color: "#1e1a14",
        }}>SERMON</div>
        <div style={{ fontSize: 12, color: "#a89880" }}>불러오는 중...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return <SermonApp user={user} profile={profile} onLogout={logout} />;
}
