import { createRoute } from 'honox/factory'
import { Layout } from '../../components/Layout'
import { MangaForm } from '../../components/MangaForm'

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

// GET /mangas/new - 漫画追加ページ表示
export default createRoute((c) => {
  return c.render(
    <Layout title="漫画を追加" showBackLink>
      <title>漫画を追加</title>
      <div class="max-w-2xl mx-auto">
        {/* Header */}
        <div class="text-center mb-10">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-gaming-purple to-gaming-pink flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gaming-purple/30">
            <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gaming-text mb-3">
            新しい漫画を追加
          </h2>
          <p class="text-gaming-text-muted max-w-md mx-auto">
            お気に入りの漫画を登録して、更新日にお知らせを受け取ろう
          </p>
        </div>

        {/* Form Card */}
        <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
          <MangaForm action="/mangas/new" />
        </div>
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
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="漫画のタイトルを入力してください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action="/mangas/new" />
          </div>
        </div>
      </Layout>
    )
  }

  if (typeof url !== 'string' || url.trim() === '') {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="作品ページのURLを入力してください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action="/mangas/new" />
          </div>
        </div>
      </Layout>
    )
  }

  const dayOfWeekNum = Number(dayOfWeek)
  if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
    return c.render(
      <Layout title="漫画を追加" showBackLink>
        <title>漫画を追加</title>
        <div class="max-w-2xl mx-auto">
          <ErrorMessage message="更新される曜日を選んでください" />
          <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
            <MangaForm action="/mangas/new" />
          </div>
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
