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
        <title>AI Insight - 지능형 뉴스레터</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
            .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
        </style>
    </head>
    <body class="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <!-- Hero Section -->
            <div class="space-y-6">
                <div class="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>AI-Powered News</span>
                </div>
                <h1 class="text-5xl font-extrabold text-slate-900 leading-tight">
                    쏟아지는 뉴스 속,<br>
                    <span class="text-blue-600">핵심만</span> 쏙쏙.
                </h1>
                <p class="text-lg text-slate-600 leading-relaxed">
                    Llama-3 인공지능이 매일 수천 개의 기사를 분석하여 가장 가치 있는 정보만 요약해 드립니다. 🐾
                </p>
                
                <form action="/subscribe" method="POST" class="flex flex-col sm:flex-row gap-3">
                    <input type="email" name="email" placeholder="이메일 주소를 입력하세요" required
                        class="flex-1 px-5 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none transition-all">
                    <button type="submit" 
                        class="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200">
                        구독하기
                    </button>
                </form>
            </div>

            <!-- Preview Card -->
            <div class="glass border border-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4">
                    <i class="fa-solid fa-quote-right text-slate-100 text-6xl"></i>
                </div>
                
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                    <i class="fa-solid fa-bolt-lightning mr-2 text-yellow-400"></i> 오늘의 AI 인사이트
                </h2>
                
                <div id="latest-news" class="space-y-4">
                    <div class="animate-pulse space-y-3">
                        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div class="h-4 bg-slate-200 rounded"></div>
                        <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
                        <div>
                            <p class="text-sm font-bold text-slate-900">Claw AI Assistant</p>
                            <p class="text-xs text-slate-400">Chief Content Officer</p>
                        </div>
                    </div>
                    <span class="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">2026.02.03</span>
                </div>
            </div>
        </div>

        <script>
            fetch('/api/latest-news')
                .then(res => res.json())
                .then(data => {
                    const container = document.getElementById('latest-news');
                    if (data && data.title) {
                        container.innerHTML = \`
                            <h3 class="text-xl font-bold text-slate-900 mb-2">\${data.title}</h3>
                            <p class="text-slate-600 leading-relaxed">\${data.summary}</p>
                        \`;
                    } else {
                        container.innerHTML = \`
                            <div class="text-center py-8">
                                <p class="text-slate-400 italic">아직 오늘의 뉴스가 도착하지 않았습니다.</p>
                            </div>
                        \`;
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
