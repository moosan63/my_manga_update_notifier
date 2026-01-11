import { createRoute } from 'honox/factory'
import { Layout } from '../../components/Layout'
import { MangaForm } from '../../components/MangaForm'

// GET /mangas/new - 漫画追加ページ表示
export default createRoute((c) => {
  return c.render(
    <Layout title="漫画を追加" showBackLink>
      <title>漫画を追加</title>
      <div class="card-gaming bg-gaming-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gaming-purple/10">
        <MangaForm action="/mangas/new" />
      </div>
    </Layout>
  )
})

// POST /mangas/new - 漫画追加処理
export const POST = createRoute(async (c) => {
  const formData = await c.req.parseBody()

  const title = formData['title']
  const url = formData['url']
  const dayOfWeek = formData['dayOfWeek']

  // バリデーション
  if (typeof title !== 'string' || title.trim() === '') {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="bg-gaming-pink/20 text-gaming-pink p-4 rounded-lg mb-4 border border-gaming-pink/30 flex items-center gap-2">
          <span>❌</span>
          <span>タイトルは必須です</span>
        </div>
        <div class="card-gaming bg-gaming-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gaming-purple/10">
          <MangaForm action="/mangas/new" />
        </div>
      </Layout>
    )
  }

  if (typeof url !== 'string' || url.trim() === '') {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="bg-gaming-pink/20 text-gaming-pink p-4 rounded-lg mb-4 border border-gaming-pink/30 flex items-center gap-2">
          <span>❌</span>
          <span>URLは必須です</span>
        </div>
        <div class="card-gaming bg-gaming-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gaming-purple/10">
          <MangaForm action="/mangas/new" />
        </div>
      </Layout>
    )
  }

  const dayOfWeekNum = Number(dayOfWeek)
  if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="bg-gaming-pink/20 text-gaming-pink p-4 rounded-lg mb-4 border border-gaming-pink/30 flex items-center gap-2">
          <span>❌</span>
          <span>曜日を選択してください</span>
        </div>
        <div class="card-gaming bg-gaming-card rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gaming-purple/10">
          <MangaForm action="/mangas/new" />
        </div>
      </Layout>
    )
  }

  const db = c.env.DB
  const now = new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)

  await db
    .prepare(
      'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(title.trim(), url.trim(), dayOfWeekNum, now, now)
    .run()

  return c.redirect('/')
})
