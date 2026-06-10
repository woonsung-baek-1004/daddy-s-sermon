// src/LoginScreen.js — 로그인 / 회원가입 화면
import { useState } from "react";

const C = {
  bg: "#faf7f2", card: "#ffffff", gold: "#b5883a", goldBg: "#fdf3e0",
  ember: "#c0501e", text: "#1e1a14", textMid: "#6b5e4a", textDim: "#a89880",
  border: "rgba(180,160,130,0.2)", shadow: "0 2px 12px rgba(100,80,50,0.08)",
  sage: "#3d7a5f", sageBg: "#eaf3ee", white: "#ffffff",
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode]         = useState("login"); // 'login' | 'register'
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [role, setRole]         = useState("dad");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);

  const inputStyle = {
    width: "100%", background: "#f8f5f0",
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    padding: "13px 16px", color: C.text, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    marginBottom: 12,
  };

  const handleSubmit = async () => {
    setError(""); 
    
    // 입력값 검증
    if (!email.trim()) { setError("이메일을 입력해주세요"); return; }
    if (!password.trim()) { setError("비밀번호를 입력해주세요"); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 해요"); return; }
    if (mode === "register" && !name.trim()) { setError("이름을 입력해주세요"); return; }

    setLoading(true);
    try {
      await onLogin({ mode, email: email.trim(), password, name: name.trim(), role });
    } catch (e) {
      const code = e.code || "";
      const msg =
        code === "auth/wrong-password"       ? "비밀번호가 틀렸어요" :
        code === "auth/invalid-credential"   ? "이메일 또는 비밀번호가 틀렸어요" :
        code === "auth/user-not-found"       ? "등록된 이메일이 없어요. 회원가입을 먼저 해주세요" :
        code === "auth/email-already-in-use" ? "이미 사용 중인 이메일이에요" :
        code === "auth/invalid-email"        ? "이메일 형식이 올바르지 않아요" :
        code === "auth/weak-password"        ? "비밀번호가 너무 단순해요 (6자 이상)" :
        code === "auth/too-many-requests"    ? "잠시 후 다시 시도해주세요" :
        code === "auth/network-request-failed" ? "인터넷 연결을 확인해주세요" :
        code === "auth/unauthorized-domain"  ? "도메인 승인이 필요해요 (아래 안내 참고)" :
        `오류: ${e.message || code}`;
      setError(msg);
      // 도메인 오류면 안내 표시
      if (code === "auth/unauthorized-domain") setShowDomainGuide(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 20px", fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontWeight: 700, marginBottom: 6 }}>
          AI & DADDY'S
        </div>
        <div style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: -1,
        }}>SERMON</div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
          삶에서 증명된 믿음의 기록
        </div>
      </div>

      {/* 카드 */}
      <div style={{
        width: "100%", maxWidth: 380,
        background: C.card, borderRadius: 20,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadow, padding: "28px 24px",
      }}>
        {/* 모드 탭 */}
        <div style={{ display: "flex", marginBottom: 24, background: "#f3ede4", borderRadius: 12, padding: 4 }}>
          {[["login", "로그인"], ["register", "회원가입"]].map(([m, lb]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "9px", borderRadius: 10, border: "none",
              background: mode === m ? C.white : "transparent",
              color: mode === m ? C.gold : C.textDim,
              fontWeight: mode === m ? 700 : 500, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: mode === m ? C.shadow : "none",
            }}>{lb}</button>
          ))}
        </div>

        {/* 회원가입 추가 필드 */}
        {mode === "register" && (
          <>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="이름 (예: 홍길동 아빠)"
              style={inputStyle} />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>역할</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["dad", "👨", "아빠"], ["child", "👧", "자녀"]].map(([r, ic, lb]) => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    flex: 1, padding: "11px", borderRadius: 12, border: `1.5px solid ${role === r ? C.gold : C.border}`,
                    background: role === r ? C.goldBg : "#f8f5f0",
                    color: role === r ? C.gold : C.textMid,
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>{ic} {lb}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" type="email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호 (6자 이상)" type="password"
          style={{ ...inputStyle, marginBottom: 0 }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />

        {error && (
          <div style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 10,
            background: "#fdf0ea", color: C.ember, fontSize: 12, fontWeight: 600,
          }}>⚠️ {error}</div>
        )}

        {/* 도메인 승인 안내 */}
        {showDomainGuide && (
          <div style={{
            marginTop: 10, padding: "12px 14px", borderRadius: 10,
            background: "#eaf3ee", fontSize: 12, color: "#2d6a4f", lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 Firebase 도메인 승인 방법</div>
            1. Firebase 콘솔 → Authentication<br/>
            2. 상단 <b>설정</b> 탭 클릭<br/>
            3. <b>승인된 도메인</b> 섹션<br/>
            4. <b>도메인 추가</b> 클릭<br/>
            5. <b>poetic-belekoy-8d7e1e.netlify.app</b> 입력 → 추가
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: 16, padding: "15px",
          borderRadius: 12, border: "none", cursor: loading ? "default" : "pointer",
          background: loading ? C.border : C.gold,
          color: C.white, fontSize: 15, fontWeight: 700, transition: "all 0.2s",
        }}>
          {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 11, color: C.textDim }}>또는</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* 구글 로그인 */}
        <button onClick={() => onLogin({ mode: "google" })} style={{
          width: "100%", padding: "13px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, background: C.white,
          color: C.text, fontSize: 14, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>G</span> 구글 계정으로 계속하기
        </button>
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: C.textDim, textAlign: "center", lineHeight: 1.7 }}>
        가족 초대 코드가 있으신가요?<br />
        로그인 후 설정에서 입력하세요
      </div>
    </div>
  );
}
