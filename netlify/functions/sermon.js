// netlify/functions/sermon.js
// Netlify Serverless Function — Claude API 프록시

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // API 키 확인
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY 환경변수가 없어요!");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API 키가 설정되지 않았어요. Netlify 환경변수를 확인해주세요." }),
    };
  }

  console.log("API 키 확인됨:", apiKey.substring(0, 10) + "...");

  try {
    const { topic } = JSON.parse(event.body);
    console.log("주제:", topic.label);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
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
  "content": "설교 내용 (400-500자, 아빠가 자녀에게 직접 말하는 따뜻하고 솔직한 어투)"
}`
        }]
      }),
    });

    console.log("API 응답 상태:", response.status);
    const data = await response.json();

    if (data.error) {
      console.error("API 오류:", data.error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }

    const text = data.content?.[0]?.text || "";
    console.log("응답 텍스트:", text.substring(0, 100));
    const clean = text.replace(/```json|```/g, "").trim();
    const sermon = JSON.parse(clean);

    return { statusCode: 200, headers, body: JSON.stringify(sermon) };
  } catch (e) {
    console.error("오류:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
