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
          class="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <span>+</span>
          <span>新規追加</span>
        </a>
      </div>
      <MangaList mangas={mangas} />
    </Layout>
  )
})
