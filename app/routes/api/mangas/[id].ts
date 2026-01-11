import { createRoute } from 'honox/factory'
import { putMangaHandler, deleteMangaHandler } from '../../../lib/manga-handlers'

// PUT /api/mangas/:id - 漫画更新
export const PUT = createRoute(putMangaHandler)

// DELETE /api/mangas/:id - 漫画削除
export const DELETE = createRoute(deleteMangaHandler)
