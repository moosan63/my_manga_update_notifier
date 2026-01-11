import { createRoute } from 'honox/factory'
import { getMangasHandler, postMangaHandler } from '../../lib/manga-handlers'

// GET /api/mangas - 漫画一覧取得
export const GET = createRoute(getMangasHandler)

// POST /api/mangas - 漫画追加
export const POST = createRoute(postMangaHandler)
