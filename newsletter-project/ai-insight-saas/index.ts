import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  AI: Ai
}

const app = new Hono<{ Bindings: Bindings }>()

const ADSENSE_PUB_ID = 'ca-pub-9958230062150527';

const RSS_FEEDS = [
  { url: 'https://anthropic.com/news/rss.xml', weight: 3 },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', weight: 2 },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', weight: 2 },
  { url: 'https://blog.google/technology/ai/rss/', weight: 2 },
  { url: 'https://nvidianews.nvidia.com/releases.xml', weight: 1 },
  { url: 'https://wired.com/feed/category/business/latest/rss', weight: 1 }
]

app.get('/ads.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  return c.text(`google.com, ${ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0`)
})

app.get('/', (c) => {
  const country = c.req.raw.cf?.country || 'US';
  const isKorea = country === 'KR';

  return c.html(`
    <!DOCTYPE html>
    <html lang="${isKorea ? 'ko' : 'en'}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JellyAI - Global AI News & Tool Insight</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700&display=swap');
            body { font-family: 'Pretendard', sans-serif; scroll-behavior: smooth; background-color: #f8fafc; }
            .glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
            .card-hover:hover { transform: translateY(-5px); transition: all 0.3s ease; }
            #loading-spinner { display: none; }
            #loading-spinner.active { display: flex; }
        </style>
    </head>
    <body class="text-slate-900">
        <nav class="sticky top-0 z-50 glass border-b border-slate-200 py-4 px-4">
            <div class="max-w-6xl mx-auto flex justify-between items-center text-left">
                <a href="/" class="text-2xl font-bold text-blue-600 flex items-center">
                    <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> JellyAI
                </a>
                <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                    <div class="relative group">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                        <input type="text" id="search-input" placeholder="${isKorea ? '뉴스 검색...' : 'Search news...'}" 
                            class="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-48 md:w-64 outline-none">
                    </div>
                    <a href="#news-grid" class="hover:text-blue-600 transition">${isKorea ? '실시간 뉴스' : 'Live News'}</a>
                    <a href="#hot-tool" class="hover:text-blue-600 transition">${isKorea ? '핫 AI 툴' : 'Hot AI Tool'}</a>
                    <a href="/privacy" class="hover:text-blue-600 transition">Privacy</a>
                </div>
            </div>
        </nav>

        <header class="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 class="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                ${isKorea ? 'AI의 미래, 당신의 언어로.' : 'Future of AI, in Your Language.'}
            </h1>
            <p class="text-lg text-slate-500 mb-10 leading-relaxed">
                ${isKorea ? '글로벌 AI 뉴스와 혁신적인 도구들을 한 곳에서 만나보세요.' : 'Global AI news and innovative tools, all in one place.'}
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="#news-grid" class="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                    ${isKorea ? '실시간 뉴스 보기' : 'Browse News'}
                </a>
                <a href="#hot-tool" class="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition shadow-sm">
                    ${isKorea ? '오늘의 핫 툴' : 'Today\'s Hot Tool'}
                </a>
            </div>
        </header>

        <main class="max-w-6xl mx-auto px-4 pb-24">
            <div class="flex flex-col lg:flex-row gap-12">
                <!-- Main Content Area -->
                <div class="flex-1">
                    <section id="news-grid" class="mb-24">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <h2 class="text-2xl font-bold flex items-center text-left">
                                <i class="fa-solid fa-rss text-orange-400 mr-2"></i> ${isKorea ? '실시간 브리핑' : 'Global Briefing'}
                            </h2>
                            <div id="category-filters" class="flex flex-wrap gap-2">
                                <button onclick="filterCategory('All')" class="cat-btn active bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all">All</button>
                                <button onclick="filterCategory('Model')" class="cat-btn bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold hover:border-blue-500 transition-all">Model</button>
                                <button onclick="filterCategory('Business')" class="cat-btn bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold hover:border-blue-500 transition-all">Business</button>
                                <button onclick="filterCategory('Tools')" class="cat-btn bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold hover:border-blue-500 transition-all">Tools</button>
                                <button onclick="filterCategory('Dev')" class="cat-btn bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold hover:border-blue-500 transition-all">Dev</button>
                            </div>
                        </div>
                        <div id="news-container" class="grid grid-cols-1 md:grid-cols-2 gap-10"></div>
                        <div id="loading-spinner" class="py-12 justify-center items-center space-x-2">
                            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                        </div>
                        <div id="scroll-sentinel" class="h-10"></div>
                    </section>

                    <section id="hot-tool" class="mb-24">
                        <div class="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-2xl">
                            <div class="relative z-10 space-y-6 text-left">
                                <div id="tool-info" class="space-y-6">
                                    <span class="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest italic">Today's Hot Tool</span>
                                    <div class="animate-pulse space-y-4">
                                        <div class="h-10 bg-white/20 rounded w-1/2"></div>
                                        <div class="h-20 bg-white/10 rounded"></div>
                                    </div>
                                </div>
                                <div id="tool-how-to-container" class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 space-y-4 text-left">
                                    <h3 class="text-lg font-bold border-b border-white/10 pb-4 flex items-center text-left">
                                        <i class="fa-solid fa-book-open mr-3"></i> ${isKorea ? '사용 가이드' : 'Quick Start'}
                                    </h3>
                                    <div id="tool-how-to-content" class="text-blue-100 text-xs leading-relaxed space-y-4 whitespace-pre-wrap mt-4 text-left">
                                        Loading guide...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Sidebar Area -->
                <aside class="w-full lg:w-80 space-y-8 flex-shrink-0">
                    <!-- Adsense Sidebar -->
                    <div class="bg-white rounded-[2rem] p-4 border border-slate-200 shadow-sm sticky top-24">
                        <p class="text-[10px] text-slate-400 mb-2 text-center uppercase tracking-widest">Advertisement</p>
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="${ADSENSE_PUB_ID}"
                             data-ad-slot="sidebar_auto"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                        
                        <hr class="my-8 border-slate-100">

                        <!-- Newsletter Form -->
                        <div id="newsletter-box" class="space-y-4">
                            <h3 class="font-bold text-lg">${isKorea ? '뉴스레터 구독' : 'Newsletter'}</h3>
                            <p class="text-sm text-slate-500">${isKorea ? '매일 새로운 AI 소식을 이메일로 받아보세요.' : 'Get daily AI insights delivered to your inbox.'}</p>
                            <form id="subscribe-form" class="space-y-3">
                                <input type="email" name="email" required placeholder="email@example.com" 
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm">
                                    ${isKorea ? '지금 구독하기' : 'Subscribe Now'}
                                </button>
                            </form>
                            <p id="subscribe-msg" class="text-xs text-center hidden"></p>
                        </div>

                        <hr class="my-8 border-slate-100">

                        <!-- Fast Track Status Card -->
                        <div class="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
                            <h3 class="font-bold mb-2 flex items-center text-sm">
                                <i class="fa-solid fa-bolt mr-2 text-yellow-300"></i> ${isKorea ? '실시간 자동화' : 'Auto-Sync'}
                            </h3>
                            <p class="text-[11px] text-blue-100 leading-relaxed">
                                ${isKorea ? 'JellyAI는 1시간마다 전세계 핫 뉴스를 자동으로 수집하고 있습니다.' : 'JellyAI syncs global hot news every hour automatically.'}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>

        <footer class="bg-slate-900 text-white py-12 px-4 text-center mt-20">
            <p class="text-sm text-slate-500">&copy; 2026 JellyAI. | Made for Global AI Enthusiasts 🐾</p>
        </footer>

        <script>
            const isKR = ${isKorea};
            let currentPage = 1;
            let isLoading = false;
            let hasMore = true;

            // Subscribe Logic
            document.getElementById('subscribe-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = e.target;
                const msg = document.getElementById('subscribe-msg');
                const btn = form.querySelector('button');
                
                btn.disabled = true;
                btn.innerText = isKR ? '처리 중...' : 'Processing...';

                try {
                    const res = await fetch('/subscribe', {
                        method: 'POST',
                        body: new FormData(form)
                    });
                    if (res.ok) {
                        form.classList.add('hidden');
                        msg.classList.remove('hidden');
                        msg.className = "text-xs text-center text-green-600 font-medium";
                        msg.innerText = isKR ? '🎉 구독이 완료되었습니다!' : '🎉 Subscription complete!';
                    } else {
                        throw new Error();
                    }
                } catch (e) {
                    msg.classList.remove('hidden');
                    msg.className = "text-xs text-center text-red-500 font-medium";
                    msg.innerText = isKR ? '오류가 발생했습니다. 다시 시도해주세요.' : 'Error occurred. Please try again.';
                    btn.disabled = false;
                    btn.innerText = isKR ? '지금 구독하기' : 'Subscribe Now';
                }
            });

            let currentCategory = 'All';

            const filterCategory = (cat) => {
                if (currentCategory === cat) return;
                currentCategory = cat;
                currentPage = 1;
                hasMore = true;
                document.getElementById('news-container').innerHTML = '';
                
                // Update UI
                document.querySelectorAll('.cat-btn').forEach(btn => {
                    if (btn.innerText === cat) {
                        btn.className = "cat-btn active bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all";
                    } else {
                        btn.className = "cat-btn bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold hover:border-blue-500 transition-all";
                    }
                });
                
                loadNews();
            };

            // Search Logic
            let searchTimeout;
            let currentSearch = '';
            document.getElementById('search-input').addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentSearch = e.target.value;
                    currentPage = 1;
                    hasMore = true;
                    document.getElementById('news-container').innerHTML = '';
                    loadNews();
                }, 500);
            });

            const loadNews = async () => {
                if (isLoading || !hasMore) return;
                isLoading = true;
                document.getElementById('loading-spinner').classList.add('active');

                try {
                    const res = await fetch('/api/list-news?page=' + currentPage + '&category=' + currentCategory + '&q=' + currentSearch);
                    const data = await res.json();
                    
                    if (data && data.length > 0) {
                        const container = document.getElementById('news-container');
                        data.forEach(n => {
                            const domain = new URL(n.url).hostname.replace('www.', '');
                            const isHot = n.importance >= 4;
                            const card = document.createElement('div');
                            card.className = "bg-white rounded-[2.5rem] border border-slate-200 shadow-sm card-hover overflow-hidden flex flex-col text-left cursor-pointer transition-all active:scale-[0.98]";
                            card.onclick = () => window.open(n.url, '_blank');
                            card.innerHTML = '<div class="relative">' +
                                    (n.image_url ? '<img src="' + n.image_url + '" class="w-full h-48 object-cover" alt="news thumbnail">' : '<div class="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-300"><i class="fa-solid fa-image text-4xl"></i></div>') +
                                    (isHot ? '<span class="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">🔥 HOT</span>' : '') +
                                    '<span class="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">' + (n.category || 'General') + '</span>' +
                                '</div>' +
                                '<div class="p-8 flex-1 flex flex-col justify-between">' +
                                    '<div>' +
                                        '<div class="flex items-center space-x-2 mb-4">' +
                                            '<span class="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">' + domain + '</span>' +
                                        '</div>' +
                                        '<h3 class="text-lg font-bold mb-4 leading-tight text-left">' + n.title + '</h3>' +
                                        '<p class="text-slate-500 text-sm leading-relaxed mb-8 text-left">' + (isKR ? n.summary : (n.summary_en || n.summary)) + '</p>' +
                                    '</div>' +
                                    '<div class="flex items-center justify-between mt-auto">' +
                                        '<span class="text-xs font-bold text-blue-600 hover:underline text-left">VIEW ARTICLE &rarr;</span>' +
                                        '<span class="text-[10px] text-slate-400 font-medium">Global Insight</span>' +
                                    '</div>' +
                                '</div>';
                            container.appendChild(card);
                        });
                        currentPage++;
                        if (data.length < 12) hasMore = false;
                    } else {
                        hasMore = false;
                    }
                } catch (e) {
                    console.error("News load failed", e);
                } finally {
                    isLoading = false;
                    document.getElementById('loading-spinner').classList.remove('active');
                }
            };

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) loadNews();
            }, { threshold: 0.1 });
            observer.observe(document.getElementById('scroll-sentinel'));

            // FIX: Tool Info Loading
            fetch('/api/hot-tool').then(r => r.json()).then(tool => {
                if (tool) {
                    document.getElementById('tool-info').innerHTML = '<span class="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest italic">Today\\\'s Hot Tool</span>' +
                        '<h2 class="text-5xl font-black text-white text-left">' + tool.name + '</h2>' +
                        '<p class="text-blue-100 text-lg leading-relaxed text-left">' + tool.description + '</p>' +
                        '<a href="' + tool.link + '" target="_blank" class="inline-block bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition shadow-xl text-left">' +
                            (isKR ? '지금 도구 보러가기' : 'Check out Tool') + ' <i class="fa-solid fa-external-link ml-2"></i>' +
                        '</a>';
                    document.getElementById('tool-how-to-content').innerHTML = tool.how_to;
                }
            });
        </script>
    </body>
    </html>
  `)
})

app.get('/api/list-news', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const category = c.req.query('category');
  const search = c.req.query('q');
  const limit = 12;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM news_summaries';
  const conditions: string[] = [];
  const params: any[] = [];
  
  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }
  
  if (search) {
    conditions.push('title LIKE ?');
    params.push(`%${search}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const news = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(news.results)
})

app.get('/api/hot-tool', async (c) => {
  const tool = await c.env.DB.prepare('SELECT * FROM hot_tools ORDER BY created_at DESC LIMIT 1').first()
  return c.json(tool)
})

app.get('/api/send-newsletter', async (c) => {
  // 1. Get Active Subscribers
  const subscribers = await c.env.DB.prepare('SELECT email FROM subscribers WHERE status = "active"').all();
  if (!subscribers.results.length) return c.json({ status: 'No subscribers' });

  // 2. Get Top 5 Hot News from last 7 days
  const hotNews = await c.env.DB.prepare('SELECT * FROM news_summaries WHERE created_at > datetime("now", "-7 days") ORDER BY importance DESC LIMIT 5').all();
  if (!hotNews.results.length) return c.json({ status: 'No news to send' });

  // Note: Actual email sending requires an API like Mailgun, SendGrid or Postmark.
  // Here we return the summary that WOULD be sent.
  return c.json({ 
    message: 'Newsletter data prepared',
    subscriberCount: subscribers.results.length,
    newsSent: hotNews.results.map(n => n.title)
  });
})

app.post('/subscribe', async (c) => {
  const { email } = await c.req.parseBody()
  try {
    await c.env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)').bind(email).run()
    return c.text('Subscription complete!')
  } catch (e) { return c.text('Error') }
})

app.get('/fetch-news', async (c) => {
  const totalWeight = RSS_FEEDS.reduce((sum, feed) => sum + feed.weight, 0);
  let random = Math.random() * totalWeight;
  let feedUrl = RSS_FEEDS[0].url;
  for (const feed of RSS_FEEDS) {
    if (random < feed.weight) {
      feedUrl = feed.url;
      break;
    }
    random -= feed.weight;
  }

  try {
    const res = await fetch(feedUrl); const xml = await res.text()
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/)
    if (!itemMatch) return c.text('No items')
    const item = itemMatch[1]
    const title = item.match(/<title>(.*?)<\/title>/)?.[1].replace('<![CDATA[', '').replace(']]>', '') || 'Untitled'
    
    // Filter out guides and non-news items
    const filterKeywords = ['how to', 'navigating', 'guide', 'update on', 'introducing', 'learning'];
    if (filterKeywords.some(k => title.toLowerCase().includes(k))) {
      return c.json({ status: 'skipped', reason: 'Non-news item', title });
    }

    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1].replace(/<[^>]*>/g, '').substring(0, 500) || ''
    
    // Advanced Image Extraction
    let imageUrl = '';
    
    // 1. Try common RSS image tags
    const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"/)?.[1];
    const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1];
    const mediaThumbnail = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1];
    const imgTag = item.match(/<img[^>]+src="([^"]+)"/)?.[1];
    
    imageUrl = mediaContent || enclosure || mediaThumbnail || imgTag || '';

    // 2. If still empty, try to fetch the page and extract og:image
    if (!imageUrl && link) {
      try {
        const pageRes = await fetch(link);
        if (pageRes.ok) {
          const html = await pageRes.text();
          imageUrl = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1] ||
                     html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/)?.[1] || '';
        }
      } catch (e) {
        console.error("Failed to fetch page for og:image", e);
      }
    }
    
    // 3. Final fallback image if all else fails
    if (!imageUrl) {
      imageUrl = `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800`;
    }

    const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { 
      prompt: `Task: Create a HIGH-IMPACT news briefing and classify it.
      Instructions: 
      1. Summarize the following into exactly ONE powerful Korean sentence and ONE English sentence.
      2. Classify into one category: [Model, Business, Tools, Dev, General].
      3. Rate importance from 1 to 5 (5 is world-changing news).
      Format: KR: [Summary] | EN: [Summary] | CAT: [Category] | IMP: [Importance]
      
      Title: ${title}
      Description: ${desc}` 
    })
    const responseText = (aiResponse as any).response || ''
    const summaryKR = responseText.match(/KR: (.*?) \|/)?.[1] || title
    const summaryEN = responseText.match(/EN: (.*?) \|/)?.[1] || title
    const category = responseText.match(/CAT: (.*?) \|/)?.[1] || 'General'
    const importance = parseInt(responseText.match(/IMP: (\d+)/)?.[1] || '1')
    
    // Normalize URL and handle 404/invalid links
    let finalLink = link;
    if (link.includes('github.com/openclaw')) {
      finalLink = 'https://docs.openclaw.ai';
    } else if (link.startsWith('/')) {
      const urlObj = new URL(feedUrl);
      finalLink = `${urlObj.protocol}//${urlObj.hostname}${link}`;
    }

    await c.env.DB.prepare('INSERT INTO news_summaries (title, summary, summary_en, url, image_url, category, importance) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(title, summaryKR, summaryEN, finalLink, imageUrl, category, importance).run()
    return c.json({ title, summaryKR, category, importance })
  } catch (e: any) { return c.text(e.message) }
})

const handler = {
  async scheduled(event: any, env: any, ctx: any) {
    ctx.waitUntil(app.fetch(new Request('https://jellyai.org/fetch-news'), env))
  },
  async fetch(request: Request, env: any, ctx: any) {
    return app.fetch(request, env, ctx)
  }
}

export default handler
