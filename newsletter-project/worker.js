export default {
  async scheduled(event, env, ctx) {
    // 1. 뉴스 소스 가져오기 (예시로 외부 뉴스 RSS나 API 호출)
    // 2. AI(예: Workers AI 또는 OpenClaw 연동)를 통해 요약 생성
    // 3. D1 데이터베이스에 저장
    
    const title = "오늘의 주요 뉴스 요약";
    const summary = "여기에 AI가 생성한 요약 내용이 들어갑니다.";
    const category = "Tech";
    const url = "https://example.com";

    await env.DB.prepare(
      "INSERT INTO news_summaries (title, summary, category, url) VALUES (?, ?, ?, ?)"
    ).bind(title, summary, category, url).run();

    console.log("뉴스 요약 저장 완료!");
  },

  async fetch(request, env) {
    // 대시보드에서 데이터를 불러올 API 엔드포인트
    const { results } = await env.DB.prepare(
      "SELECT * FROM news_summaries ORDER BY created_at DESC LIMIT 10"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};
