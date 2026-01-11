import { createRoute } from 'honox/factory'
import { Layout } from '../../components/Layout'
import { MangaForm } from '../../components/MangaForm'

// GET /mangas/new - 漫画追加ページ表示
export default createRoute((c) => {
  return c.render(
    <Layout title="漫画を追加" showBackLink>
      <title>漫画を追加</title>
      <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
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
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">タイトルは必須です</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <MangaForm action="/mangas/new" />
        </div>
      </Layout>
    )
  }

  if (typeof url !== 'string' || url.trim() === '') {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">URLは必須です</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
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
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">曜日を選択してください</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
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
