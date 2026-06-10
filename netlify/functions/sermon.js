// netlify/functions/sermon.js
// Netlify Serverless Function — Claude API 프록시

exports.handler = async (event) => {
  // CORS 헤더
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { topic } = JSON.parse(event.body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `당신은 아빠가 자녀에게 전하는 따뜻한 신앙 설교를 쓰는 전문가입니다.

주제: "${topic.label}" (${topic.sub || topic.label})

다음 JSON 형식으로만 응답하세요 (마크다운 없이 순수 JSON):
{
  "verse": "성경 구절 (예: 잠언 3:5-6)",
  "verseText": "구절 내용 전체",
  "title": "설교 제목 (자녀 마음에 와닿는 제목)",
  "content": "설교 내용 (400-500자, 아빠가 자녀에게 직접 말하는 따뜻하고 솔직한 어투. 실제 삶의 예시 포함. 너무 설교조 말고 아빠가 아이에게 이야기하듯)"
}`
        }]
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const sermon = JSON.parse(clean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sermon),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
