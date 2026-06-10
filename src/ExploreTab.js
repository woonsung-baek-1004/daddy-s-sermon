// src/ExploreTab.js — 탐색 탭 (AI설교 생성 + 아빠설교 검색)
import { useState } from "react";

const C = {
  bg: "#faf7f2", card: "#ffffff", surface: "#f3ede4", cardAlt: "#fdf9f4",
  gold: "#b5883a", goldBg: "#fdf3e0", goldLight: "#d4a85a",
  ember: "#c0501e", emberBg: "#fdf0ea",
  sage: "#3d7a5f", sageBg: "#eaf3ee",
  lavender: "#6254a8", lavenderBg: "#f0eef9",
  text: "#1e1a14", textMid: "#6b5e4a", textDim: "#a89880",
  border: "rgba(180,160,130,0.2)", white: "#ffffff",
  shadow: "0 2px 12px rgba(100,80,50,0.08)",
  shadowMd: "0 4px 24px rgba(100,80,50,0.12)",
};

const CHILD_TOPICS = [
  { icon: "📚", label: "공부·학업",   sub: "시험, 성적, 집중력",         color: "#4a7cc9", bg: "#eef3fc" },
  { icon: "🤝", label: "친구 관계",   sub: "우정, 따돌림, 갈등",         color: "#3d7a5f", bg: "#eaf3ee" },
  { icon: "🌠", label: "꿈과 비전",   sub: "진로, 재능, 소명",           color: "#b5883a", bg: "#fdf3e0" },
  { icon: "🌱", label: "성품·인격",   sub: "정직, 책임감, 배려",         color: "#5a8a3a", bg: "#f0f7ea" },
  { icon: "✝️", label: "예수 닮기",   sub: "기도, 말씀, 신앙생활",       color: "#8b5e3c", bg: "#fdf3ec" },
  { icon: "🪞", label: "외모·자존감", sub: "외모 콤플렉스, 자기 이미지", color: "#b04a7a", bg: "#fdf0f6" },
  { icon: "💪", label: "격려·용기",   sub: "두려움, 포기하고 싶을 때",   color: "#c0501e", bg: "#fdf0ea" },
  { icon: "💔", label: "상처·용서",   sub: "마음의 상처, 용서하기",      color: "#9b4a4a", bg: "#fdf0f0" },
  { icon: "📱", label: "디지털·유혹", sub: "SNS, 게임, 중독",            color: "#6254a8", bg: "#f0eef9" },
  { icon: "🏠", label: "가족·부모",   sub: "부모 공경, 형제 관계",       color: "#4a7a8a", bg: "#eaf4f7" },
];

const DAD_TOPICS = [
  { icon: "💼", label: "직장·사업",  color: "#c0501e", bg: "#fdf0ea" },
  { icon: "💰", label: "돈·가난",    color: "#b5883a", bg: "#fdf3e0" },
  { icon: "😔", label: "실패·수치",  color: "#9b4a4a", bg: "#fdf0f0" },
  { icon: "⚔️", label: "분노·용서",  color: "#c0501e", bg: "#fdf0ea" },
  { icon: "🏥", label: "질병·고통",  color: "#6254a8", bg: "#f0eef9" },
  { icon: "🌙", label: "기도·새벽",  color: "#4a7a8a", bg: "#eaf4f7" },
];

function AISermonCard({ sermon, onClose }) {
  return (
    <div style={{
      background: C.card, border: `1.5px solid ${C.gold}30`,
      borderRadius: 18, padding: "20px",
      boxShadow: C.shadowMd, marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: C.gold,
          background: C.goldBg, padding: "3px 10px", borderRadius: 99,
          letterSpacing: 1,
        }}>✦ AI 생성 설교</div>
        <button onClick={onClose} style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 99, padding: "4px 12px",
          fontSize: 11, color: C.textMid, cursor: "pointer",
        }}>✕ 닫기</button>
      </div>

      <div style={{
        background: C.goldBg, border: `1px solid ${C.gold}25`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 14,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{sermon.verse}</div>
        <div style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.6,
        }}>"{sermon.verseText}"</div>
      </div>

      <div style={{
        fontFamily: "'Noto Serif KR', Georgia, serif",
        fontSize: 18, color: C.text, fontWeight: 700,
        lineHeight: 1.4, marginBottom: 14,
      }}>{sermon.title}</div>

      <div style={{
        fontSize: 14, color: C.textMid, lineHeight: 1.9,
        paddingLeft: 14, borderLeft: `3px solid ${C.goldLight}`,
        whiteSpace: "pre-wrap",
      }}>{sermon.content}</div>
    </div>
  );
}

export default function ExploreTab({ liveSermons, onOpenSermon }) {
  const [exploreMode, setExploreMode] = useState("ai"); // 'ai' | 'dad'
  const [generating, setGenerating]   = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [aiSermon, setAiSermon]       = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const generateSermon = async (topic) => {
    setSelectedTopic(topic);
    setAiSermon(null);
    setGenerating(true);

    try {
      const response = await fetch("/.netlify/functions/sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error("서버 오류: " + response.status);
      const sermon = await response.json();
      setAiSermon(sermon);
    } catch (e) {
      setAiSermon({
        verse: "잠언 3:5-6",
        verseText: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라",
        title: `${topic.label}에 대한 아빠의 말`,
        content: "설교를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.\n\n오류: " + e.message,
      });
    }
    setGenerating(false);
  };

  const filteredDadSermons = liveSermons.filter(s =>
    searchQuery
      ? (s.verse?.includes(searchQuery) || s.title?.includes(searchQuery) || s.text?.includes(searchQuery) || s.snippet?.includes(searchQuery))
      : true
  );

  return (
    <div style={{ padding: "18px 16px 0" }}>

      {/* 제목 */}
      <div style={{
        fontFamily: "'Noto Serif KR', Georgia, serif",
        fontSize: 22, color: C.text, fontWeight: 900, marginBottom: 4,
      }}>말씀 탐색</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 1.6 }}>
        자녀의 상황에 맞는 설교를 찾아보세요
      </div>

      {/* AI설교 / 아빠설교 탭 */}
      <div style={{
        display: "flex", background: C.surface,
        borderRadius: 14, padding: 4, marginBottom: 20,
        border: `1px solid ${C.border}`,
      }}>
        {[["ai", "✦ AI 설교", "주제별 즉시 생성"], ["dad", "👨 아빠 설교", "가족이 올린 설교"]].map(([mode, label, sub]) => (
          <button key={mode} onClick={() => { setExploreMode(mode); setAiSermon(null); }} style={{
            flex: 1, padding: "10px 8px", borderRadius: 10,
            border: "none", cursor: "pointer",
            background: exploreMode === mode ? C.white : "transparent",
            boxShadow: exploreMode === mode ? C.shadow : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: exploreMode === mode ? C.gold : C.textMid }}>{label}</div>
            <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* ── AI 설교 모드 ── */}
      {exploreMode === "ai" && (
        <div>
          {/* AI 설교 결과 */}
          {generating && (
            <div style={{
              background: C.goldBg, border: `1px solid ${C.gold}30`,
              borderRadius: 16, padding: "24px", textAlign: "center", marginBottom: 16,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
              <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 4 }}>AI가 설교를 작성 중이에요</div>
              <div style={{ fontSize: 12, color: C.textDim }}>"{selectedTopic?.label}" 주제로 말씀을 찾고 있어요...</div>
            </div>
          )}

          {aiSermon && !generating && (
            <AISermonCard sermon={aiSermon} onClose={() => { setAiSermon(null); setSelectedTopic(null); }} />
          )}

          {/* 자녀 주제 카테고리 */}
          {!aiSermon && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 12 }}>
                자녀를 위한 주제 — 탭하면 AI가 설교를 만들어요
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {CHILD_TOPICS.map((s, i) => (
                  <div key={i} onClick={() => generateSermon(s)} style={{
                    background: C.card, border: `1.5px solid ${C.border}`,
                    borderRadius: 16, padding: "14px 14px 12px",
                    cursor: "pointer", boxShadow: C.shadow, transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = s.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 7, lineHeight: 1 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8, lineHeight: 1.4 }}>{s.sub}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: s.color,
                      background: s.bg, padding: "2px 8px", borderRadius: 99,
                      display: "inline-block", border: `1px solid ${s.color}25`,
                    }}>AI 설교 생성 →</div>
                  </div>
                ))}
              </div>

              {/* 아빠 현장 증언 */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 12 }}>
                아빠의 삶 현장 주제
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {DAD_TOPICS.map((t, i) => (
                  <div key={i} onClick={() => generateSermon({ ...t, sub: "아빠의 삶의 현장" })} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 99,
                    background: C.white, border: `1.5px solid ${t.color}30`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bg}
                    onMouseLeave={e => e.currentTarget.style.background = C.white}
                  >
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 아빠 설교 모드 ── */}
      {exploreMode === "dad" && (
        <div>
          {/* 검색 */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="구절, 주제, 내용으로 검색..."
              style={{
                width: "100%", background: C.white,
                border: `1.5px solid ${C.border}`, borderRadius: 14,
                padding: "13px 16px 13px 44px", color: C.text, fontSize: 14,
                outline: "none", boxSizing: "border-box", boxShadow: C.shadow,
              }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          </div>

          {filteredDadSermons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", border: `1.5px dashed ${C.border}`, borderRadius: 18, background: C.cardAlt }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🕊</div>
              <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8 }}>
                {searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : "아직 올라온 아빠 설교가 없어요"}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>
                {filteredDadSermons.length}편의 설교
              </div>
              {filteredDadSermons.map(s => (
                <div key={s.id} onClick={() => onOpenSermon(s)} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: "16px", marginBottom: 10,
                  cursor: "pointer", boxShadow: C.shadow, transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = C.shadowMd}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = C.shadow}
                >
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 6 }}>{s.verse}</div>
                  <div style={{
                    fontFamily: "'Noto Serif KR', Georgia, serif",
                    fontSize: 15, color: C.text, fontWeight: 700, lineHeight: 1.4, marginBottom: 6,
                  }}>{s.title || "제목 없음"}</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 8 }}>
                    {(s.snippet || s.text || "").slice(0, 60)}...
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{s.avatar || "👨"}</span>
                    <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{s.dad || s.dadName} 아빠</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>· {s.date}</span>
                    <span style={{
                      marginLeft: "auto", fontSize: 9, padding: "2px 8px", borderRadius: 99,
                      background: s.track === "community" ? C.sageBg : C.goldBg,
                      color: s.track === "community" ? C.sage : C.gold,
                      fontWeight: 700,
                    }}>{s.track === "community" ? "🌿 공동체" : "🏠 가족"}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
