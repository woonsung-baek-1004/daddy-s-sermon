import { useState, useRef, useEffect } from "react";
import UploadSheet from "./UploadSheet";
import ExploreTab from "./ExploreTab";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// ── DESIGN TOKENS — Warm Light Theme ──────────────────────────
const C = {
  bg: "#faf7f2",
  surface: "#f3ede4",
  card: "#ffffff",
  cardAlt: "#fdf9f4",
  border: "rgba(180,160,130,0.2)",
  borderStrong: "rgba(180,160,130,0.4)",
  gold: "#b5883a",
  goldLight: "#d4a85a",
  goldBg: "#fdf3e0",
  ember: "#c0501e",
  emberBg: "#fdf0ea",
  sage: "#3d7a5f",
  sageBg: "#eaf3ee",
  lavender: "#6254a8",
  lavenderBg: "#f0eef9",
  text: "#1e1a14",
  textMid: "#6b5e4a",
  textDim: "#a89880",
  white: "#ffffff",
  shadow: "0 2px 12px rgba(100,80,50,0.08)",
  shadowMd: "0 4px 24px rgba(100,80,50,0.12)",
};

// ── DATA ────────────────────────────────────────────────────────
const SERMONS = [
  {
    id: 1, dad: "이준혁", role: "중학교 2학년 아빠", avatar: "👨‍💼",
    verse: "잠언 2:6", verseText: "대저 여호와는 지혜를 주시며 지식과 명철을 그 입에서 내심이며",
    title: "시험 전날 밤, 아빠도 그 자리에 있었어",
    type: "voice", duration: "4:32", date: "2025.05.28",
    situation: "공부·학업", tags: ["공부", "지혜", "믿음"],
    snippet: "현수야, 아빠도 네 나이 때 시험 전날 밤이면 위가 뒤집혔어. 그런데 진짜 공부는 성적표에 찍히는 숫자가 아니더라. 하나님이 주시는 지혜는 책상 앞에서만 오는 게 아니라—두려움 없이 앉아 있는 그 고요한 마음에서 오더라고.",
    children: ["은지(16)", "현수(13)"], likes: 47, comments: 12, track: "both",
  },
  {
    id: 2, dad: "박성민", role: "고등학교 1학년 아빠", avatar: "👨‍👧",
    verse: "잠언 17:17", verseText: "친구는 사랑이 끊이지 아니하고 형제는 위급한 때를 위하여 났느니라",
    title: "친구 때문에 울던 날, 아빠가 하고 싶었던 말",
    type: "text", duration: null, date: "2025.05.26",
    situation: "친구 관계", tags: ["우정", "상처", "사랑"],
    snippet: "민준아, 네가 친한 친구한테 뒤통수 맞았다고 방에서 혼자 울던 날 기억나? 아빠는 문 밖에서 다 들었어. 그때 들어가지 못했던 게 지금도 미안해. 진짜 친구는 숫자가 아니야—한 명이라도 이 말씀처럼 '사랑이 끊이지 않는' 친구면 충분해.",
    children: ["민준(14)"], likes: 61, comments: 19, track: "both",
  },
  {
    id: 3, dad: "김태원", role: "고등학교 3학년 아빠", avatar: "👨‍👧‍👦",
    verse: "예레미야 29:11", verseText: "여호와의 말씀이니라 너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라",
    title: "꿈을 모르겠다고 했던 너에게",
    type: "document", duration: null, date: "2025.05.24",
    situation: "꿈과 비전", tags: ["진로", "꿈", "소명"],
    snippet: "서연아, '아빠 나는 꿈이 없어'라고 했던 그 저녁 식사 자리, 아빠는 그 말이 마음에 오래 걸렸어. 꿈이 없는 게 아니야—아직 하나님이 심어두신 씨앗이 싹을 안 틔운 것뿐이야. 이 말씀처럼, 하나님은 이미 너의 미래를 알고 계셔. 그리고 그건 반드시 '희망'이야.",
    children: ["서연(17)", "지호(10)"], likes: 89, comments: 31, track: "community",
  },
];

const CHILD_TOPICS = [
  { icon: "📚", label: "공부·학업",     sub: "시험, 성적, 집중력",         count: 38, color: "#4a7cc9", bg: "#eef3fc" },
  { icon: "🤝", label: "친구 관계",     sub: "우정, 따돌림, 갈등",         count: 45, color: "#3d7a5f", bg: "#eaf3ee" },
  { icon: "🌠", label: "꿈과 비전",     sub: "진로, 재능, 소명",           count: 31, color: "#b5883a", bg: "#fdf3e0" },
  { icon: "🌱", label: "성품·인격",     sub: "정직, 책임감, 배려",         count: 27, color: "#5a8a3a", bg: "#f0f7ea" },
  { icon: "✝️", label: "예수 닮기",     sub: "기도, 말씀, 신앙생활",       count: 52, color: "#8b5e3c", bg: "#fdf3ec" },
  { icon: "🪞", label: "외모·자존감",   sub: "외모 콤플렉스, 자기 이미지", count: 19, color: "#b04a7a", bg: "#fdf0f6" },
  { icon: "💪", label: "격려·용기",     sub: "두려움, 포기하고 싶을 때",   count: 41, color: "#c0501e", bg: "#fdf0ea" },
  { icon: "💔", label: "상처·용서",     sub: "마음의 상처, 용서하기",      count: 23, color: "#9b4a4a", bg: "#fdf0f0" },
  { icon: "📱", label: "디지털·유혹",   sub: "SNS, 게임, 중독",            count: 16, color: "#6254a8", bg: "#f0eef9" },
  { icon: "🏠", label: "가족·부모",     sub: "부모 공경, 형제 관계",       count: 29, color: "#4a7a8a", bg: "#eaf4f7" },
];

const DAD_THEME = {
  icon: "⚒️",
  label: "아빠의 현장 증언",
  sub: "직장·사업·실패·회복 — 말씀으로 버텨온 아빠의 이야기",
  color: "#c0501e",
  bg: "#fdf0ea",
  topics: [
    { icon: "💼", label: "직장·사업",  count: 23 },
    { icon: "💰", label: "돈·가난",    count: 15 },
    { icon: "😔", label: "실패·수치",  count: 19 },
    { icon: "⚔️", label: "분노·용서",  count: 14 },
    { icon: "🏥", label: "질병·고통",  count: 18 },
    { icon: "🌙", label: "기도·새벽",  count: 27 },
  ],
};

// ── HELPERS ─────────────────────────────────────────────────────
const Badge = ({ type }) => {
  const map = {
    voice: ["🎙", C.ember, C.emberBg, "음성"],
    text: ["✏️", C.sage, C.sageBg, "텍스트"],
    document: ["📜", C.lavender, C.lavenderBg, "설교문"],
  };
  const [ic, col, bg, lb] = map[type] || [];
  return (
    <span style={{
      fontSize: 10, padding: "3px 9px", borderRadius: 99,
      background: bg, color: col,
      border: `1px solid ${col}30`, fontWeight: 600,
    }}>{ic} {lb}</span>
  );
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: C.textDim,
    letterSpacing: 1.5, textTransform: "uppercase",
    marginBottom: 12,
  }}>{children}</div>
);

// ── SERMON CARD ──────────────────────────────────────────────────
function SermonCard({ s, onOpen, compact }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div onClick={() => onOpen(s)} style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 18, padding: compact ? "14px 16px" : "18px 20px",
      marginBottom: 12, cursor: "pointer",
      boxShadow: C.shadow,
      transition: "box-shadow 0.2s, transform 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadowMd; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = "none"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: C.surface, fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${C.border}`,
        }}>{s.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.dad} 아빠</span>
            <span style={{ fontSize: 11, color: C.textDim }}>· {s.role}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge type={s.type} />
            <span style={{ fontSize: 10, color: C.textDim }}>{s.date}</span>
          </div>
        </div>
      </div>

      {/* Verse pill */}
      <div style={{
        display: "inline-block",
        fontSize: 11, fontWeight: 700, color: C.gold,
        background: C.goldBg, padding: "4px 12px", borderRadius: 99,
        marginBottom: 8, letterSpacing: 0.5,
      }}>{s.verse}</div>

      {/* Title */}
      <div style={{
        fontFamily: "'Noto Serif KR', Georgia, serif",
        fontSize: compact ? 14 : 16, color: C.text,
        fontWeight: 700, lineHeight: 1.5, marginBottom: compact ? 0 : 8,
      }}>{s.title}</div>

      {!compact && (
        <>
          <div style={{
            fontSize: 13, color: C.textMid, lineHeight: 1.8,
            marginBottom: 12, paddingLeft: 12,
            borderLeft: `3px solid ${C.border}`,
          }}>
            {s.snippet}
          </div>

          {/* Voice player */}
          {s.type === "voice" && (
            <div onClick={e => e.stopPropagation()} style={{
              background: C.emberBg, border: `1px solid ${C.ember}25`,
              borderRadius: 12, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}>
              <button onClick={() => setPlaying(!playing)} style={{
                width: 34, height: 34, borderRadius: "50%",
                background: playing ? C.ember : C.white,
                border: `2px solid ${C.ember}`,
                cursor: "pointer", fontSize: 12,
                color: playing ? C.white : C.ember,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{playing ? "⏸" : "▶"}</button>
              <div style={{ flex: 1, display: "flex", gap: 2, height: 24, alignItems: "center" }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3, borderRadius: 2, flexShrink: 0,
                    height: `${10 + Math.abs(Math.sin(i * 0.85 + 0.3)) * 14}px`,
                    background: i < (playing ? 10 : 0) ? C.ember : `${C.ember}35`,
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: C.textMid, flexShrink: 0, fontWeight: 600 }}>{s.duration}</span>
            </div>
          )}

          {/* Tags + stats */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {s.tags.map(t => (
                <span key={t} style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 99,
                  background: C.surface, color: C.textMid,
                  border: `1px solid ${C.border}`,
                }}>#{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.textDim, fontWeight: 600 }}>🔥 {s.likes}</span>
              <span style={{ fontSize: 12, color: C.textDim, fontWeight: 600 }}>💬 {s.comments}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── SERMON DETAIL MODAL ──────────────────────────────────────────
function SermonModal({ sermon, onClose }) {
  if (!sermon) return null;
  return (
    <div style={{
      position: "fixed",
      top: 180, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      bottom: 0,
      zIndex: 100, // 탭바(200)보다 무조건 낮게
      background: "rgba(30,20,10,0.45)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end",
      pointerEvents: "none", // 오버레이 자체는 클릭 통과
    }}>
      {/* 실제 모달 내용만 클릭 받음 */}
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%",
        background: C.card, borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 40px rgba(100,80,50,0.18)",
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
        padding: "0 24px 52px",
        pointerEvents: "auto",
      }}>
        {/* 닫기 핸들 + 버튼 */}
        <div style={{ padding: "14px 0 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={onClose} style={{
            padding: "6px 14px", borderRadius: 99,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>✕ 닫기</button>
        </div>

        {/* Verse */}
        <div style={{
          background: C.goldBg, border: `1px solid ${C.gold}30`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1, marginBottom: 6 }}>{sermon.verse}</div>
          <div style={{
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: 14, color: C.text, lineHeight: 1.7, fontStyle: "italic",
          }}>"{sermon.verseText}"</div>
        </div>

        <div style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 20, color: C.text, fontWeight: 700,
          lineHeight: 1.4, marginBottom: 14,
        }}>{sermon.title}</div>

        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          padding: "12px 14px", background: C.surface,
          borderRadius: 12, border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 26 }}>{sermon.avatar}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{sermon.dad} 아빠</div>
            <div style={{ fontSize: 11, color: C.textDim }}>{sermon.role} · {sermon.date}</div>
          </div>
          <Badge type={sermon.type} />
        </div>

        <div style={{
          fontSize: 14, color: C.text, lineHeight: 1.9,
          paddingLeft: 14, borderLeft: `3px solid ${C.goldLight}`,
          marginBottom: 20,
        }}>
          {sermon.snippet}
          <br /><br />
          공부가 힘들어도, 친구 때문에 상처받아도, 미래가 막막해 보여도—아빠는 네가 이 말씀 위에 서 있기를 바라. 하나님이 너를 향해 갖고 계신 생각은 반드시 선하고 아름다워.
          <br /><br />
          아빠가 네 곁에 항상 있을 수는 없지만, 이 말씀은 늘 네 곁에 있을 거야. 사랑한다.
        </div>

        {/* AI 연결 */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10 }}>AI 연결 분석</div>
        {[
          { color: C.gold, bg: C.goldBg, icon: "✦", label: "원어 통찰", desc: '"능력 주시는 자(ἐνδυναμοῦντι)"는 현재 능동 분사형 — 지금 이 순간에도 계속 힘을 불어넣으시는 분이라는 의미입니다.' },
          { color: C.sage, bg: C.sageBg, icon: "🔗", label: "비슷한 아빠 증언", desc: "같은 구절로 같은 상황을 지나온 아빠 4명의 설교가 연결되어 있어요." },
          { color: C.lavender, bg: C.lavenderBg, icon: "👧", label: "자녀 눈높이 버전", desc: "초등·중학생 눈높이로 재구성된 버전을 자녀에게 바로 보낼 수 있어요." },
        ].map((item, i) => (
          <div key={i} style={{
            background: item.bg, border: `1px solid ${item.color}25`,
            borderRadius: 12, padding: "12px 14px", marginBottom: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 6 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>{item.desc}</div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{
            flex: 1, padding: "14px", borderRadius: 12,
            background: C.goldBg, border: `1px solid ${C.gold}40`,
            color: C.gold, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>📤 자녀에게 보내기</button>
          <button style={{
            flex: 1, padding: "14px", borderRadius: 12,
            background: C.emberBg, border: `1px solid ${C.ember}40`,
            color: C.ember, fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>🔖 보관함 저장</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────
export default function SermonApp({ user, profile, onLogout }) {
  window.__sermonUser    = user;
  window.__sermonProfile = profile;

  const [tab, setTab]               = useState(0);
  const [communityTab, setCommunityTab] = useState(false);
  const [modal, setModal]           = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSermons, setLiveSermons] = useState([]);

  // Firebase 실시간 설교 불러오기
  useEffect(() => {
    const q = query(
      collection(db, "sermons"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        avatar: "👨",
        dad: d.data().dadName || "아빠",
        role: d.data().dadRole || "아빠",
        likes: d.data().likes?.length || 0,
        comments: 0,
        date: d.data().createdAt?.toDate
          ? d.data().createdAt.toDate().toLocaleDateString("ko-KR")
          : "최근",
        track: d.data().track || "family",
        tags: d.data().tags || [],
        snippet: d.data().text || "",
      }));
      setLiveSermons(data);
    });
    return unsub;
  }, []);
  const TABS = [
    { icon: "🕊", label: "말씀" },
    { icon: "✦", label: "올리기" },
    { icon: "📖", label: "탐색" },
    { icon: "🏠", label: "보관함" },
  ];

  // 헤더 높이: padding-top 52 + 내용 약 72 = 124px, 탭바 약 56px → 합계 180px
  const HEADER_H = 124;
  const TABBAR_H = 56;
  const TOP_OFFSET = HEADER_H + TABBAR_H;

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      background: C.bg,
      color: C.text, maxWidth: 430,
      margin: "0 auto", position: "relative",
      minHeight: "100vh",
    }}>

      {/* ── HEADER — fixed, always on top ── */}
      <div style={{
        position: "fixed",
        top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        padding: "52px 22px 16px",
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(100,80,50,0.06)",
        zIndex: 200,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontWeight: 700, marginBottom: 4 }}>
              AI & DADDY'S
            </div>
            <div style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: -0.5,
            }}>SERMON</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>
              삶에서 증명된 믿음의 기록
            </div>
          </div>

          {/* Track toggle */}
          <div style={{
            display: "flex", background: C.surface,
            border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden",
          }}>
            {[["🏠", "가족", false], ["🌿", "공동체", true]].map(([ic, lb, val]) => (
              <button key={lb} onClick={() => setCommunityTab(val)} style={{
                padding: "8px 12px", border: "none", cursor: "pointer",
                background: communityTab === val ? C.gold : "transparent",
                color: communityTab === val ? C.white : C.textMid,
                fontSize: 11, fontWeight: 700, transition: "all 0.2s",
              }}>{ic} {lb}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR — fixed just below header ── */}
      <div style={{
        position: "fixed",
        top: HEADER_H,
        left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        display: "flex",
        background: C.card,
        borderBottom: `1px solid ${C.border}`,
        boxShadow: "0 2px 6px rgba(100,80,50,0.05)",
        zIndex: 200,
      }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => {
            setModal(null); // 탭 이동 시 항상 모달 닫기
            if (i === 1) {
              setUploading(true);
            } else {
              setUploading(false);
              setTab(i);
            }
          }} style={{
            flex: 1, padding: "12px 4px 10px", fontSize: 10,
            border: "none", cursor: "pointer",
            background: "transparent",
            borderBottom: tab === i && i !== 1 ? `2.5px solid ${C.gold}` : "2.5px solid transparent",
            color: tab === i && i !== 1 ? C.gold : i === 1 ? C.gold : C.textDim,
            fontWeight: tab === i || i === 1 ? 700 : 500,
            letterSpacing: 0.3, transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            position: "relative", zIndex: 200, // 탭 버튼은 항상 최상위
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── SCROLLABLE CONTENT — padded below fixed header+tabbar ── */}
      <div style={{ paddingTop: TOP_OFFSET, paddingBottom: 48 }}>

        {/* ══ TAB 0: FEED ══ */}
        {tab === 0 && (
          <div style={{ padding: "18px 16px 0" }}>

            {/* Daily word banner */}
            <div style={{
              background: `linear-gradient(135deg, ${C.goldBg}, #fff9f0)`,
              border: `1.5px solid ${C.gold}35`,
              borderRadius: 20, padding: "18px 20px", marginBottom: 20,
              boxShadow: "0 2px 16px rgba(181,136,58,0.1)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 3, marginBottom: 8 }}>TODAY'S WORD</div>
              <div style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: 16, color: C.text, lineHeight: 1.7, marginBottom: 10, fontWeight: 700,
              }}>
                "너희를 향한 나의 생각을 내가 아나니<br />평안이요 재앙이 아니니라<br />너희에게 미래와 희망을 주는 것이니라"
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>예레미야 29:11</div>
                <div style={{
                  fontSize: 11, color: C.gold, background: C.white,
                  padding: "5px 12px", borderRadius: 99, fontWeight: 700,
                  border: `1px solid ${C.gold}30`, cursor: "pointer",
                }}>오늘 5명의 아빠 →</div>
              </div>
            </div>

            {/* Feed label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <SectionLabel>{communityTab ? "🌿 공동체 설교" : "🏠 우리 가족 설교"}</SectionLabel>
              <button style={{ fontSize: 11, color: C.gold, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>최신순 ▾</button>
            </div>

            {liveSermons.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 16px", border: `1.5px dashed ${C.border}`, borderRadius: 18, background: C.cardAlt }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🕊</div>
                <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8 }}>아직 설교가 없어요</div>
                <button onClick={() => setUploading(true)} style={{ marginTop: 12, padding: "11px 24px", borderRadius: 99, background: C.gold, border: "none", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>첫 설교 남기기 →</button>
              </div>
            ) : (
              liveSermons
                .filter(s => communityTab ? s.track === "community" : true)
                .map(s => <SermonCard key={s.id} s={s} onOpen={setModal} />)
            )}
          </div>
        )}


        {/* ══ TAB 2: EXPLORE ══ */}
        {tab === 2 && (
          <ExploreTab liveSermons={liveSermons} onOpenSermon={setModal} />
        )}


        {/* ══ TAB 3: VAULT ══ */}
        {tab === 3 && (
          <div style={{ padding: "18px 16px 0" }}>
            <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 22, color: C.text, fontWeight: 900, marginBottom: 4 }}>
              가족 보관함
            </div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 20 }}>
              아빠의 설교는 가장 오래가는 유산이에요
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                [String(liveSermons.length), "편", "저장된 설교"],
                [String(liveSermons.filter(s => s.uid === user?.uid).length), "편", "내 설교"],
              ].map(([v, u, lb], i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px", textAlign: "center", boxShadow: C.shadow }}>
                  <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 24, color: C.gold, fontWeight: 900 }}>{v}<span style={{ fontSize: 12 }}>{u}</span></div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4, fontWeight: 600 }}>{lb}</div>
                </div>
              ))}
            </div>

            {/* 실제 올린 설교 섹션 — 위쪽 */}
            <SectionLabel>📖 내가 올린 설교</SectionLabel>
            {liveSermons.filter(s => s.uid === user?.uid).length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", border: `1.5px dashed ${C.border}`, borderRadius: 16, background: C.cardAlt, marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: C.textDim }}>아직 올린 설교가 없어요</div>
                <button onClick={() => setUploading(true)} style={{ marginTop: 10, padding: "9px 20px", borderRadius: 99, background: C.gold, border: "none", color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>첫 설교 올리기 →</button>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                {liveSermons.filter(s => s.uid === user?.uid).map(s => (
                  <div key={s.id} style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 16, padding: "16px", marginBottom: 10,
                    boxShadow: C.shadow,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setModal(s)}>
                        <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>{s.verse}</div>
                        <div style={{ fontSize: 14, color: C.text, fontWeight: 700, lineHeight: 1.4 }}>{s.title || s.snippet?.slice(0, 30) + "..."}</div>
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{s.date} · {s.track === "family" ? "🏠 가족" : "🌿 공동체"}</div>
                      </div>
                      <button onClick={async () => {
                        if (!window.confirm("이 설교를 삭제할까요?")) return;
                        try {
                          const { doc, deleteDoc } = await import("firebase/firestore");
                          await deleteDoc(doc(db, "sermons", s.id));
                        } catch(e) { alert("삭제 오류: " + e.message); }
                      }} style={{
                        padding: "6px 12px", borderRadius: 99, border: `1px solid #fca5a5`,
                        background: "#fff5f5", color: "#dc2626", fontSize: 11,
                        fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 10,
                      }}>🗑 삭제</button>
                    </div>
                    {s.snippet && (
                      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${C.border}` }}>
                        {s.snippet.slice(0, 80)}{s.snippet.length > 80 ? "..." : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 샘플 설교 섹션 — 아래쪽 */}
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>✦ AI 샘플 설교</SectionLabel>
              {SERMONS.map(s => (
                <SermonCard key={s.id} s={s} onOpen={setModal} compact />
              ))}
            </div>

            {/* 공동체 연결 */}
            <div style={{ background: C.sageBg, border: `1.5px solid ${C.sage}30`, borderRadius: 18, padding: "18px", marginTop: 16 }}>
              <div style={{ fontSize: 14, color: C.sage, fontWeight: 700, marginBottom: 6 }}>🌿 공동체로 확장하기</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 14 }}>
                내 설교를 다른 가족과 나누면 집단 성경 지성이 시작돼요.
              </div>
              <button onClick={() => setCommunityTab(true)} style={{ padding: "11px 22px", borderRadius: 99, background: C.sage, border: "none", color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>공동체 둘러보기 →</button>
            </div>
          </div>
        )}

      </div>
      {/* end scrollable content */}

      {modal && <SermonModal sermon={modal} onClose={() => setModal(null)} />}
      {uploading && <UploadSheet onClose={() => { setUploading(false); }} user={user} profile={profile} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #c0b0a0; }
        ::-webkit-scrollbar { width: 0; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
