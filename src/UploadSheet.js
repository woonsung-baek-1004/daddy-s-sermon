// src/UploadSheet.js — 설교 올리기 (Firebase 직접 저장)
import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const C = {
  bg: "#faf7f2", card: "#ffffff", surface: "#f3ede4",
  gold: "#b5883a", goldBg: "#fdf3e0", goldLight: "#d4a85a",
  ember: "#c0501e", emberBg: "#fdf0ea",
  sage: "#3d7a5f", sageBg: "#eaf3ee",
  lavender: "#6254a8", lavenderBg: "#f0eef9",
  text: "#1e1a14", textMid: "#6b5e4a", textDim: "#a89880",
  border: "rgba(180,160,130,0.2)", white: "#ffffff",
  shadow: "0 2px 12px rgba(100,80,50,0.08)",
};

const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

export default function UploadSheet({ onClose, user, profile }) {
  const [step, setStep]           = useState(0);
  const [type, setType]           = useState(null);
  const [verse, setVerse]         = useState("");
  const [title, setTitle]         = useState("");
  const [text, setText]           = useState("");
  const [track, setTrack]         = useState("family");
  const [saving, setSaving]       = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec]       = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef              = useRef(null);
  const timerRef                  = useRef(null);

  const startRec = () => {
    setRecording(true); setRecSec(0);
    timerRef.current = setInterval(() => setRecSec(s => s + 1), 1000);
  };
  const stopRec = () => { setRecording(false); clearInterval(timerRef.current); };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // 텍스트 파일이면 내용 읽기
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setText(ev.target.result);
      reader.readAsText(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let fileUrl = null;
      let fileName = null;

      // 파일이 있으면 Storage에 업로드
      if (selectedFile && type === "document") {
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("./firebase");
        const path = `sermons/${user?.uid}/${Date.now()}_${selectedFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, selectedFile);
        fileUrl = await getDownloadURL(storageRef);
        fileName = selectedFile.name;
      }

      await addDoc(collection(db, "sermons"), {
        uid:      user?.uid      || "unknown",
        dadName:  profile?.displayName || user?.displayName || "아빠",
        dadRole:  profile?.role  || "아빠",
        familyId: profile?.familyId || null,
        verse:    verse.trim(),
        title:    title.trim(),
        text:     text.trim(),
        type:     type || "text",
        track:    track,
        tags:     [],
        fileUrl,
        fileName,
        likes:    [],
        createdAt: serverTimestamp(),
      });
      setStep(3);
    } catch (e) {
      alert("저장 오류: " + e.message);
    }
    setSaving(false);
  };

  const TYPES = [
    { key: "voice",    icon: "🎙", label: "음성 녹음",    sub: "가장 생생한 아빠의 목소리", color: C.ember,    bg: C.emberBg    },
    { key: "text",     icon: "✍️", label: "텍스트 작성",  sub: "자유롭게 써내려가기",       color: C.sage,     bg: C.sageBg     },
    { key: "document", icon: "📜", label: "설교문 업로드", sub: "PDF · Word · 사진 파일",    color: C.lavender, bg: C.lavenderBg },
  ];

  const inputStyle = {
    width: "100%", background: C.surface,
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    padding: "14px 16px", color: C.text, fontSize: 14,
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed", top: 180, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, bottom: 0,
      zIndex: 150, // 헤더(200)보다 낮게 — 탭 항상 클릭 가능
      background: "rgba(30,20,10,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", background: C.card,
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 40px rgba(100,80,50,0.15)",
        padding: "0 22px 56px",
        maxHeight: "calc(100vh - 180px)", overflowY: "auto",
      }}>
        <div style={{ padding: "14px 0 0", textAlign: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 16px" }} />
        </div>

        {/* 진행 바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {["형식", "말씀", "내용", "완료"].map((lb, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 2, marginBottom: 5, background: i <= step ? C.gold : C.border, transition: "background 0.3s" }} />
              <div style={{ fontSize: 10, fontWeight: i <= step ? 700 : 400, color: i <= step ? C.gold : C.textDim, textAlign: "center" }}>{lb}</div>
            </div>
          ))}
        </div>

        {/* STEP 0 — 형식 선택 */}
        {step === 0 && (
          <div>
            <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 20, color: C.text, fontWeight: 700, marginBottom: 4 }}>어떻게 전하실 건가요?</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>편한 방식으로 선택하세요</div>
            {TYPES.map(t => (
              <div key={t.key} onClick={() => { setType(t.key); setStep(1); }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px",
                borderRadius: 14, marginBottom: 10, cursor: "pointer",
                border: `1.5px solid ${C.border}`, background: C.card,
                boxShadow: C.shadow, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = t.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
              >
                <div style={{ width: 50, height: 50, borderRadius: 14, background: t.bg, border: `1px solid ${t.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: C.text, fontWeight: 700, marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{t.sub}</div>
                </div>
                <div style={{ color: C.textDim, fontSize: 20 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — 말씀 입력 */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 20, color: C.text, fontWeight: 700, marginBottom: 4 }}>어떤 말씀인가요?</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>삶에서 살아난 그 구절을 입력해주세요</div>
            <input value={verse} onChange={e => setVerse(e.target.value)}
              placeholder="예: 빌립보서 4:13"
              style={{ ...inputStyle, marginBottom: 12, fontSize: 15, fontFamily: "'Noto Serif KR', Georgia, serif" }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="제목 (선택)"
              style={{ ...inputStyle, marginBottom: 20 }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 10, letterSpacing: 1.5 }}>공개 범위</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[["family","🏠","우리 가족만","Track 1"],["community","🌿","공동체 공개","Track 2"]].map(([k,ic,lb,sub]) => (
                <button key={k} onClick={() => setTrack(k)} style={{
                  flex: 1, padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                  border: `1.5px solid ${track===k ? C.gold : C.border}`,
                  background: track===k ? C.goldBg : C.surface,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ic}</div>
                  <div style={{ fontSize: 13, color: track===k ? C.gold : C.text, fontWeight: 700 }}>{lb}</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
            <button disabled={!verse.trim()} onClick={() => setStep(2)} style={{
              width: "100%", padding: "15px", borderRadius: 12, border: "none",
              cursor: verse.trim() ? "pointer" : "not-allowed",
              background: verse.trim() ? C.gold : C.border,
              color: verse.trim() ? C.white : C.textDim,
              fontSize: 15, fontWeight: 700,
            }}>다음 단계 →</button>
          </div>
        )}

        {/* STEP 2 — 내용 입력 */}
        {step === 2 && (
          <div>
            <div style={{ background: C.goldBg, border: `1px solid ${C.gold}30`, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>선택한 말씀</div>
              <div style={{ fontSize: 15, color: C.text, fontWeight: 700, fontFamily: "'Noto Serif KR', serif" }}>{verse}</div>
              {title && <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{title}</div>}
            </div>

            {type === "voice" && (
              <div style={{ background: C.emberBg, border: `1.5px solid ${C.ember}30`, borderRadius: 20, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: recording ? C.ember : C.white, border: `3px solid ${C.ember}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, cursor: "pointer", transition: "all 0.3s" }} onClick={recording ? stopRec : startRec}>
                  {recording ? "⏹" : "🎙"}
                </div>
                <div style={{ fontSize: 34, color: recording ? C.ember : C.textDim, fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{fmt(recSec)}</div>
                <div style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                  {recording ? "녹음 중... 탭하여 중지" : recSec > 0 ? "녹음 완료 — 저장하세요" : "탭하여 시작"}
                </div>
              </div>
            )}

            {type === "text" && (
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={"이 말씀이 내 삶에서 어떻게 살아났는지...\n\n자녀에게 전하고 싶은 이야기를 자유롭게 써주세요."}
                style={{ ...inputStyle, minHeight: 200, lineHeight: 1.9, resize: "none" }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            )}

            {type === "document" && (
              <div>
                {/* 숨겨진 파일 input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {/* 파일 선택 영역 */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${selectedFile ? C.sage : C.lavender}50`,
                    borderRadius: 18, padding: "28px 20px", textAlign: "center",
                    background: selectedFile ? C.sageBg : C.lavenderBg,
                    cursor: "pointer", marginBottom: 12,
                  }}>
                  {selectedFile ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                      <div style={{ fontSize: 14, color: C.sage, fontWeight: 700 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
                        {(selectedFile.size / 1024).toFixed(0)}KB · 탭하면 다시 선택
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>📎</div>
                      <div style={{ fontSize: 14, color: C.lavender, fontWeight: 700 }}>파일 선택하기</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.7 }}>
                        PDF · Word(.docx) · 텍스트(.txt)<br />
                        사진(JPG · PNG) — 폰 갤러리에서도 가능
                      </div>
                    </>
                  )}
                </div>

                {/* 텍스트로 직접 입력도 가능 */}
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>또는 직접 입력</div>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="설교문 내용을 여기에 붙여넣기 하세요..."
                  style={{ ...inputStyle, minHeight: 120, lineHeight: 1.8, resize: "none" }}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || (type === "text" && !text.trim()) || (type === "document" && !selectedFile && !text.trim())}
              style={{
                width: "100%", padding: "15px", borderRadius: 12, border: "none",
                cursor: saving ? "default" : "pointer",
                background: saving ? C.border : C.gold,
                color: saving ? C.textDim : C.white,
                fontSize: 15, fontWeight: 700, marginTop: 18,
              }}>
              {saving ? "저장 중..." : track === "family" ? "🏠 가족 보관함에 저장" : "🌿 공동체에 올리기"}
            </button>
          </div>
        )}

        {/* STEP 3 — 완료 */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.goldBg, border: `2px solid ${C.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 18px" }}>✦</div>
            <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 22, color: C.text, fontWeight: 700, marginBottom: 8 }}>저장되었어요!</div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.8, marginBottom: 24 }}>
              아빠의 설교가 {track === "family" ? "가족 보관함에" : "공동체에"} 저장됐어요 🎉
            </div>
            <button onClick={onClose} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: C.gold, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
