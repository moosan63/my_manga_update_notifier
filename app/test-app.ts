import { Hono } from 'hono'
import {
  getMangasHandler,
  postMangaHandler,
  putMangaHandler,
  deleteMangaHandler
} from './lib/manga-handlers'
import {
  getSettingsHandler,
  postSettingsHandler
} from './lib/settings-handlers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/mangas
app.get('/api/mangas', getMangasHandler)

// POST /api/mangas
app.post('/api/mangas', postMangaHandler)

// PUT /api/mangas/:id
app.put('/api/mangas/:id', putMangaHandler)

// DELETE /api/mangas/:id
app.delete('/api/mangas/:id', deleteMangaHandler)

// GET /api/settings
app.get('/api/settings', getSettingsHandler)

// POST /api/settings
app.post('/api/settings', postSettingsHandler)

export default app
