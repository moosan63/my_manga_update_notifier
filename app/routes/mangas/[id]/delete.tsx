import { createRoute } from 'honox/factory'

// POST /mangas/:id/delete - 漫画削除処理
export const POST = createRoute(async (c) => {
  const id = c.req.param('id')
  const db = c.env.DB

  // 存在確認
  const existing = await db.prepare('SELECT id FROM mangas WHERE id = ?').bind(id).first()
  if (!existing) {
    return c.notFound()
  }

  await db.prepare('DELETE FROM mangas WHERE id = ?').bind(id).run()

  return c.redirect('/')
})
