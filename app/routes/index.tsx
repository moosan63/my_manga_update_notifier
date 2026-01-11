import { createRoute } from 'honox/factory'
import { Layout } from '../components/Layout'
import { MangaList } from '../components/MangaList'
import { type Manga, type MangaRow, toManga } from '../lib/manga-handlers'

export default createRoute(async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM mangas ORDER BY id DESC').all<MangaRow>()
  const mangas: Manga[] = (result.results || []).map(toManga)

  return c.render(
    <Layout>
      <title>漫画更新通知</title>

      {/* Hero Section */}
      <div class="relative mb-12 overflow-hidden">
        {/* Background decoration */}
        <div class="absolute inset-0 -z-10">
          <div class="absolute top-0 left-1/4 w-96 h-96 bg-gaming-purple/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-gaming-pink/10 rounded-full blur-3xl"></div>
        </div>

        <div class="text-center py-12">
          <h2 class="text-4xl sm:text-5xl font-black text-gaming-text mb-4 leading-tight">
            <span class="bg-gradient-to-r from-gaming-purple via-gaming-pink to-gaming-cyan bg-clip-text text-transparent">
              大好きな漫画を
            </span>
            <br />
            <span class="text-gaming-text">見逃さない</span>
          </h2>
          <p class="text-lg text-gaming-text-muted max-w-2xl mx-auto mb-8">
            お気に入りの漫画を登録しておくと、更新日にSlackでお知らせ。
            <br class="hidden sm:block" />
            もう「あれ、今週の更新いつだっけ?」なんて悩みません。
          </p>

          {mangas.length > 0 && (
            <a
              href="/mangas/new"
              class="btn-gradient inline-flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl shadow-gaming-purple/30 hover:shadow-2xl hover:shadow-gaming-purple/40"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>漫画を追加する</span>
            </a>
          )}
        </div>
      </div>

      {/* Stats bar (only show if there are mangas) */}
      {mangas.length > 0 && (
        <div class="mb-8 flex items-center justify-between bg-gaming-card/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gaming-purple/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gaming-purple to-gaming-pink flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gaming-text-muted">登録中の漫画</p>
              <p class="text-2xl font-bold text-gaming-text">{mangas.length}<span class="text-sm font-normal text-gaming-text-muted ml-1">作品</span></p>
            </div>
          </div>
          <div class="text-sm text-gaming-text-muted">
            毎週の更新をお知らせ中
          </div>
        </div>
      )}

      {/* Manga List */}
      <MangaList mangas={mangas} />
    </Layout>
  )
})
