import { createRoute } from 'honox/factory'
import { Layout } from '../../../components/Layout'
import { MangaForm } from '../../../components/MangaForm'
import { type Manga, type MangaRow, toManga } from '../../../lib/manga-handlers'

// GET /mangas/:id/edit - 漫画編集ページ表示
export default createRoute(async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  const row = await db.prepare('SELECT * FROM mangas WHERE id = ?').bind(id).first<MangaRow>()

  if (!row) {
    return c.notFound()
  }

  const manga: Manga = toManga(row)

  return c.render(
    <Layout title="漫画を編集" showBackLink>
      <title>漫画を編集</title>
      <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <MangaForm manga={manga} action={`/mangas/${id}/edit`} />
      </div>
    </Layout>
  )
})

// POST /mangas/:id/edit - 漫画更新処理
export const POST = createRoute(async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  // 存在確認
  const existing = await db.prepare('SELECT id FROM mangas WHERE id = ?').bind(id).first()
  if (!existing) {
    return c.notFound()
  }

  const formData = await c.req.parseBody()

  const title = formData['title']
  const url = formData['url']
  const dayOfWeek = formData['dayOfWeek']

  // バリデーション
  if (typeof title !== 'string' || title.trim() === '') {
    return c.render(
      <Layout title="漫画を編集" showBackLink>
        <title>漫画を編集</title>
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">タイトルは必須です</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <MangaForm action={`/mangas/${id}/edit`} />
        </div>
      </Layout>
    )
  }

  if (typeof url !== 'string' || url.trim() === '') {
    return c.render(
      <Layout title="漫画を編集" showBackLink>
        <title>漫画を編集</title>
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">URLは必須です</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <MangaForm action={`/mangas/${id}/edit`} />
        </div>
      </Layout>
    )
  }

  const dayOfWeekNum = Number(dayOfWeek)
  if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
    return c.render(
      <Layout title="漫画を編集" showBackLink>
        <title>漫画を編集</title>
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">曜日を選択してください</div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <MangaForm action={`/mangas/${id}/edit`} />
        </div>
      </Layout>
    )
  }

  const now = new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)

  await db
    .prepare('UPDATE mangas SET title = ?, url = ?, day_of_week = ?, updated_at = ? WHERE id = ?')
    .bind(title.trim(), url.trim(), dayOfWeekNum, now, id)
    .run()

  return c.redirect('/')
})
