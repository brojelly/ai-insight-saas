import { Hono } from 'hono'
import { ai } from 'hono/ai'

type Bindings = {
  DB: D1Database
  AI: Ai
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. UI 및 구독 폼
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Insight Newsletter</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">🐾 AI Insight</h1>
            <p class="text-gray-600 mb-6">매일 아침, 인공지능이 요약한 핵심 뉴스를 보내드립니다.</p>
            
            <form action="/subscribe" method="POST" class="space-y-4">
                <div>
                    <input type="email" name="email" placeholder="email@example.com" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
                <button type="submit" 
                    class="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                    무료로 구독하기
                </button>
            </form>
            
            <div class="mt-8">
                <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">최신 요약 뉴스</h2>
                <div id="latest-news" class="text-sm text-gray-700 italic">
                    뉴스를 불러오는 중...
                </div>
            </div>
        </div>
        <script>
            fetch('/api/latest-news')
                .then(res => res.json())
                .then(data => {
                    const container = document.getElementById('latest-news');
                    if (data && data.title) {
                        container.innerHTML = "<strong>" + data.title + "</strong>: " + data.summary;
                    } else {
                        container.innerText = "아직 등록된 뉴스가 없습니다.";
                    }
                });
        </script>
    </body>
    </html>
  `)
})

// 2. 구독 API (DB 연동)
app.post('/subscribe', async (c) => {
  const { email } = await c.req.parseBody()
  try {
    await c.env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)').bind(email).run()
    return c.text('구독해주셔서 감사합니다! 🐾')
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) {
      return c.text('이미 구독 중인 이메일입니다. 😊')
    }
    return c.text('오류가 발생했습니다. 다시 시도해주세요.', 500)
  }
})

// 3. 최신 뉴스 조회 API
app.get('/api/latest-news', async (c) => {
  const news = await c.env.DB.prepare('SELECT * FROM news_summaries ORDER BY created_at DESC LIMIT 1').first()
  return c.json(news)
})

// 4. 샘플 뉴스 생성 (AI 모델 사용)
app.get('/generate-sample', async (c) => {
  const prompt = "Generate a short, one-sentence interesting news summary about Artificial Intelligence in 2026."
  
  const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
    prompt: prompt
  })
  
  const summary = (response as any).response || "AI 기술이 세상을 바꾸고 있습니다."
  const title = "2026 AI 트렌드 리포트"
  
  await c.env.DB.prepare('INSERT INTO news_summaries (title, summary, category) VALUES (?, ?, ?)')
    .bind(title, summary, 'Tech')
    .run()
    
  return c.text('샘플 뉴스가 생성되고 DB에 저장되었습니다! 🚀\n요약: ' + summary)
})

export default app
