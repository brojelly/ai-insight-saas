import { Hono } from 'hono'

type Bindings = {
  AI: any
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.html('<h1>AI Insight SaaS</h1><p>창의적인 AI 인사이트를 수집 중입니다.</p>')
})

app.get('/fetch-insights', async (c) => {
  // 1. Hacker News AI 관련 뉴스 가져오기 (Algolia API 활용)
  const hnResponse = await fetch('https://hn.algolia.com/api/v1/search?query=AI&tags=story&hitsPerPage=3')
  const data: any = await hnResponse.json()
  
  const stories = data.hits.map((hit: any) => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`
  }))

  // 2. Cloudflare Workers AI로 창의적 인사이트 추출
  const insightPrompt = `Below are the latest AI news titles. Provide a creative insight or a "what if" scenario for each to inspire builders: \n${stories.map((s: any) => "- " + s.title).join('\n')}`
  
  const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
    prompt: insightPrompt
  })

  return c.json({
    date: new Date().toISOString(),
    raw_news: stories,
    creative_insights: aiResponse
  })
})

export default app
