import { createRoute } from 'honox/factory'
import { Layout } from '../../../components/Layout'
import { MangaForm } from '../../../components/MangaForm'
import { type Manga, type MangaRow, toManga } from '../../../lib/manga-handlers'

// Error Message Component
const ErrorMessage = ({ message }: { message: string }) => (
  <div class="bg-gradient-to-r from-gaming-pink/20 to-rose-500/20 text-gaming-pink p-5 rounded-2xl mb-6 border border-gaming-pink/30 flex items-center gap-4 max-w-2xl mx-auto">
    <div class="w-12 h-12 rounded-xl bg-gaming-pink/20 flex items-center justify-center flex-shrink-0">
      <svg class="w-6 h-6 text-gaming-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <p class="font-bold text-lg">入力内容を確認してね</p>
      <p class="text-gaming-pink/80 text-sm">{message}</p>
    </div>
  </div>
)

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
      <div class="max-w-2xl mx-auto">
        {/* Header */}
        <div class="text-center mb-10">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-gaming-cyan to-gaming-blue flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gaming-cyan/30">
            <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gaming-text mb-3">
            {manga.title}
          </h2>
          <p class="text-gaming-text-muted max-w-md mx-auto">
            登録内容を変更できます
          </p>
        </div>

        {/* Form Card */}
        <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
          <MangaForm manga={manga} action={`/mangas/${id}/edit`} submitLabel="変更を保存する" />
        </div>
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
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="漫画のタイトルを入力してください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action={`/mangas/${id}/edit`} submitLabel="変更を保存する" />
          </div>
        </div>
      </Layout>
    )
  }

  if (typeof url !== 'string' || url.trim() === '') {
    return c.render(
      <Layout title="漫画を編集" showBackLink>
        <title>漫画を編集</title>
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="作品ページのURLを入力してください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action={`/mangas/${id}/edit`} submitLabel="変更を保存する" />
          </div>
        </div>
      </Layout>
    )
  }

  const dayOfWeekNum = Number(dayOfWeek)
  if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
    return c.render(
      <Layout title="漫画を編集" showBackLink>
        <title>漫画を編集</title>
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="更新される曜日を選んでください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action={`/mangas/${id}/edit`} submitLabel="変更を保存する" />
          </div>
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
