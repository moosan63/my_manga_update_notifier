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
      <div class="mb-6">
        <a
          href="/mangas/new"
          class="btn-gradient inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-medium hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl hover:shadow-gaming-purple/30"
        >
          <span class="text-lg">✨</span>
          <span>新規追加</span>
          <span class="text-lg">➕</span>
        </a>
      </div>
      <MangaList mangas={mangas} />
    </Layout>
  )
})
