import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  AI: Ai
}

const app = new Hono<{ Bindings: Bindings }>()

// RSS 피드 목록 (AI 관련)
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
  'https://wired.com/feed/category/business/latest/rss'
]

// 1. 메인 UI
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
            <div class="space-y-6">
                <div class="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>Real-time AI News</span>
                </div>
                <h1 class="text-5xl font-extrabold text-slate-900 leading-tight">
                    쏟아지는 AI 소식,<br>
                    <span class="text-blue-600">핵심만</span> 요약.
                </h1>
                <p class="text-lg text-slate-600 leading-relaxed">
                    전 세계 주요 매체의 AI 소식을 수집하여 Llama-3가 단 한 문장으로 명쾌하게 요약해 드립니다. 🐾
                </p>
                <div class="flex flex-col space-y-3">
                    <form action="/subscribe" method="POST" class="flex flex-col sm:flex-row gap-3">
                        <input type="email" name="email" placeholder="이메일 주소를 입력하세요" required
                            class="flex-1 px-5 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none transition-all">
                        <button type="submit" 
                            class="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200">
                            구독하기
                        </button>
                    </form>
                    <div class="flex items-center justify-center sm:justify-start">
                        <button onclick="document.getElementById('preview-section').scrollIntoView({behavior: 'smooth'})" 
                            class="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors flex items-center group">
                            먼저 둘러볼게요 <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div id="preview-section" class="glass border border-white rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                <div class="absolute top-0 right-0 p-4">
                    <i class="fa-solid fa-quote-right text-slate-100 text-6xl"></i>
                </div>
                <div>
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <i class="fa-solid fa-bolt-lightning mr-2 text-yellow-400"></i> 오늘의 실시간 AI 인사이트
                    </h2>
                    <div id="latest-news" class="space-y-4">
                        <div class="animate-pulse space-y-3">
                            <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div class="h-4 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
                        <div>
                            <p class="text-sm font-bold text-slate-900">Claw AI Newsroom</p>
                            <p class="text-xs text-slate-400">Llama-3 Analytics</p>
                        </div>
                    </div>
                    <button onclick="location.reload()" class="text-slate-400 hover:text-blue-500 transition-colors">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
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
                            <a href="\${data.url}" target="_blank" class="text-blue-500 text-sm hover:underline flex items-center mt-2">
                                원문 보기 <i class="fa-solid fa-external-link ml-1 text-[10px]"></i>
                            </a>
                        \`;
                    } else {
                        container.innerHTML = \`
                            <div class="text-center py-8">
                                <p class="text-slate-400 italic">뉴스를 가져오는 중입니다. 잠시만 기다려주세요!</p>
                            </div>
                        \`;
                    }
                });
        </script>
    </body>
    </html>
  `)
})

// 2. 구독 API
app.post('/subscribe', async (c) => {
  const { email } = await c.req.parseBody()
  try {
    await c.env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)').bind(email).run()
    return c.text('구독해주셔서 감사합니다! 🐾')
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) return c.text('이미 구독 중인 이메일입니다. 😊')
    return c.text('오류 발생', 500)
  }
})

// 3. 최신 뉴스 조회 API
app.get('/api/latest-news', async (c) => {
  const news = await c.env.DB.prepare('SELECT * FROM news_summaries ORDER BY created_at DESC LIMIT 1').first()
  return c.json(news)
})

// 4. 진짜 뉴스 수집 및 AI 요약 (Fetch & AI)
app.get('/fetch-news', async (c) => {
  const feedUrl = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)]
  
  try {
    const res = await fetch(feedUrl)
    const xml = await res.text()
    
    // 간단한 XML 파싱 (제목, 링크 추출)
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/)
    if (!itemMatch) return c.text('기사를 찾을 수 없습니다.')
    
    const item = itemMatch[1]
    const title = item.match(/<title>(.*?)<\/title>/)?.[1].replace('<![CDATA[', '').replace(']]>', '') || '제목 없음'
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1].replace(/<[^>]*>/g, '').substring(0, 500) || ''

    // AI 요약 (한국어로 요약 요청)
    const prompt = `Translate and summarize this AI news title and description into one concise Korean sentence: Title: ${title}, Description: ${description}`
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt })
    const summary = (aiResponse as any).response || title

    // DB 저장 (중복 체크 없이 우선 저장)
    await c.env.DB.prepare('INSERT INTO news_summaries (title, summary, url, category) VALUES (?, ?, ?, ?)')
      .bind(title, summary, link, 'AI')
      .run()

    return c.json({ title, summary, link })
  } catch (e: any) {
    return c.text('Error: ' + e.message, 500)
  }
})

export default app
