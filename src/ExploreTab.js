// src/ExploreTab.js — 탐색 탭 (샘플 말씀 데이터 + 아빠설교 검색)
import { useState } from "react";
import { SERMON_DATA } from "./sermonData";

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
  { icon: "📚", label: "공부·학업",   color: "#4a7cc9", bg: "#eef3fc" },
  { icon: "🤝", label: "친구 관계",   color: "#3d7a5f", bg: "#eaf3ee" },
  { icon: "🌠", label: "꿈과 비전",   color: "#b5883a", bg: "#fdf3e0" },
  { icon: "🌱", label: "성품·인격",   color: "#5a8a3a", bg: "#f0f7ea" },
  { icon: "✝️", label: "예수 닮기",   color: "#8b5e3c", bg: "#fdf3ec" },
  { icon: "🪞", label: "외모·자존감", color: "#b04a7a", bg: "#fdf0f6" },
  { icon: "💪", label: "격려·용기",   color: "#c0501e", bg: "#fdf0ea" },
  { icon: "💔", label: "상처·용서",   color: "#9b4a4a", bg: "#fdf0f0" },
  { icon: "📱", label: "디지털·유혹", color: "#6254a8", bg: "#f0eef9" },
  { icon: "🏠", label: "가족·부모",   color: "#4a7a8a", bg: "#eaf4f7" },
];

function SermonDetailCard({ sermon, onClose }) {
  return (
    <div style={{
      background: C.card, border: `1.5px solid ${C.gold}30`,
      borderRadius: 18, padding: "20px",
      boxShadow: C.shadowMd, marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: C.gold,
          background: C.goldBg, padding: "3px 10px", borderRadius: 99,
        }}>✦ AI 말씀 해설</div>
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
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{sermon.verse}</div>
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
        marginBottom: 16,
      }}>{sermon.content}</div>
      {sermon.dadWord && (
        <div style={{
          background: C.emberBg, border: `1px solid ${C.ember}25`,
          borderRadius: 12, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.ember, marginBottom: 6 }}>👨 아빠의 한마디</div>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, fontStyle: "italic" }}>
            "{sermon.dadWord}"
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploreTab({ liveSermons, onOpenSermon }) {
  const [exploreMode, setExploreMode] = useState("ai");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDadSermons = liveSermons.filter(s =>
    searchQuery
      ? (s.verse?.includes(searchQuery) || s.title?.includes(searchQuery) ||
         s.text?.includes(searchQuery) || s.snippet?.includes(searchQuery))
      : true
  );

  const categorySermons = selectedCategory ? SERMON_DATA[selectedCategory] || [] : [];
  const topicInfo = CHILD_TOPICS.find(t => t.label === selectedCategory);

  return (
    <div style={{ padding: "18px 16px 0" }}>
      <div style={{
        fontFamily: "'Noto Serif KR', Georgia, serif",
        fontSize: 22, color: C.text, fontWeight: 900, marginBottom: 4,
      }}>말씀 탐색</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        자녀의 상황에 맞는 말씀을 찾아보세요
      </div>

      <div style={{
        display: "flex", background: C.surface,
        borderRadius: 14, padding: 4, marginBottom: 20,
        border: `1px solid ${C.border}`,
      }}>
        {[["ai", "✦ AI 말씀 해설", "주제별 말씀 해설"], ["dad", "👨 아빠 설교", "가족이 올린 설교"]].map(([mode, label, sub]) => (
          <button key={mode} onClick={() => {
            setExploreMode(mode);
            setSelectedCategory(null);
            setSelectedSermon(null);
          }} style={{
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

      {exploreMode === "ai" && (
        <div>
          {selectedSermon && (
            <SermonDetailCard sermon={selectedSermon} onClose={() => setSelectedSermon(null)} />
          )}

          {selectedCategory && !selectedSermon && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <button onClick={() => setSelectedCategory(null)} style={{
                  padding: "6px 14px", borderRadius: 99,
                  background: C.surface, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.textMid, cursor: "pointer",
                }}>← 뒤로</button>
                <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 16, fontWeight: 700, color: C.text }}>
                  {topicInfo?.icon} {selectedCategory}
                </div>
              </div>
              {categorySermons.map((s, i) => (
                <div key={i} onClick={() => setSelectedSermon(s)} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                  cursor: "pointer", boxShadow: C.shadow, transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadowMd; e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginBottom: 4 }}>{s.verse}</div>
                  <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 14, color: C.text, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{s.content.slice(0, 60)}...</div>
                </div>
              ))}
            </div>
          )}

          {!selectedCategory && !selectedSermon && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 12 }}>
                주제를 선택하면 말씀 해설 20편이 나와요
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {CHILD_TOPICS.map((s, i) => (
                  <div key={i} onClick={() => setSelectedCategory(s.label)} style={{
                    background: C.card, border: `1.5px solid ${C.border}`,
                    borderRadius: 16, padding: "14px 14px 12px",
                    cursor: "pointer", boxShadow: C.shadow, transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = s.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 7 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 8 }}>{s.label}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: s.color,
                      background: s.bg, padding: "2px 8px", borderRadius: 99,
                      display: "inline-block", border: `1px solid ${s.color}25`,
                    }}>말씀 해설 20편 →</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {exploreMode === "dad" && (
        <div>
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
              <div style={{ fontSize: 14, color: C.textMid }}>
                {searchQuery ? `"${searchQuery}" 검색 결과가 없어요` : "아직 올라온 아빠 설교가 없어요"}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>{filteredDadSermons.length}편의 설교</div>
              {filteredDadSermons.map(s => (
                <div key={s.id} onClick={() => onOpenSermon(s)} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: "16px", marginBottom: 10,
                  cursor: "pointer", boxShadow: C.shadow,
                }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 6 }}>{s.verse}</div>
                  <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 15, color: C.text, fontWeight: 700, marginBottom: 6 }}>{s.title || "제목 없음"}</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 8 }}>{(s.snippet || s.text || "").slice(0, 60)}...</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{s.avatar || "👨"}</span>
                    <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{s.dad || s.dadName} 아빠</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>· {s.date}</span>
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
