// src/Comments.js — 실시간 댓글
import { useState } from "react";
import { useComments, addComment, deleteComment } from "./useSermons";

const C = {
  card: "#ffffff", gold: "#b5883a", goldBg: "#fdf3e0",
  sage: "#3d7a5f", sageBg: "#eaf3ee", ember: "#c0501e",
  text: "#1e1a14", textMid: "#6b5e4a", textDim: "#a89880",
  border: "rgba(180,160,130,0.2)", surface: "#f3ede4",
};

export default function Comments({ sermonId, user, profile }) {
  const comments       = useComments(sermonId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await addComment(sermonId, user, profile, text.trim());
    setText("");
    setSending(false);
  };

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60)   return "방금";
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    return `${Math.floor(diff/86400)}일 전`;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 12 }}>
        댓글 {comments.length}개
      </div>

      {/* 댓글 목록 */}
      {comments.map(c => (
        <div key={c.id} style={{
          display: "flex", gap: 10, marginBottom: 12,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: c.role === "dad" ? C.goldBg : C.sageBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, border: `1px solid ${C.border}`,
          }}>{c.role === "dad" ? "👨" : "👧"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.displayName}</span>
              <span style={{ fontSize: 10, color: C.textDim }}>{fmtDate(c.createdAt)}</span>
              {user?.uid === c.uid && (
                <button onClick={() => deleteComment(sermonId, c.id)} style={{
                  marginLeft: "auto", fontSize: 10, color: C.textDim,
                  background: "none", border: "none", cursor: "pointer",
                }}>삭제</button>
              )}
            </div>
            <div style={{
              fontSize: 13, color: C.textMid, lineHeight: 1.6,
              background: C.surface, borderRadius: "4px 12px 12px 12px",
              padding: "8px 12px",
            }}>{c.text}</div>
          </div>
        </div>
      ))}

      {comments.length === 0 && (
        <div style={{
          textAlign: "center", padding: "16px",
          fontSize: 12, color: C.textDim,
        }}>첫 댓글을 남겨보세요 ✦</div>
      )}

      {/* 댓글 입력 */}
      {user ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            placeholder="댓글 달기..."
            onKeyDown={e => e.key === "Enter" && handleSend()}
            style={{
              flex: 1, background: C.surface,
              border: `1.5px solid ${C.border}`, borderRadius: 12,
              padding: "10px 14px", fontSize: 13, color: C.text,
              outline: "none", fontFamily: "inherit",
            }}
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} style={{
            padding: "10px 16px", borderRadius: 12, border: "none",
            background: text.trim() ? C.gold : C.border,
            color: text.trim() ? "#fff" : C.textDim,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s", flexShrink: 0,
          }}>{sending ? "..." : "전송"}</button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: C.textDim, textAlign: "center", padding: 12 }}>
          댓글을 달려면 로그인이 필요해요
        </div>
      )}
    </div>
  );
}
