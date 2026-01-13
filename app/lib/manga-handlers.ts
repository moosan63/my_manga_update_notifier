import type { Context } from 'hono'

// スケジュールタイプの定義
export type ScheduleType = 'weekly' | 'biweekly' | 'monthly'

// Manga型の定義
export interface Manga {
  id: number
  title: string
  url: string
  scheduleType: ScheduleType
  dayOfWeek: number | null
  monthlyDays: number[] | null
  baseDate: string | null
  createdAt: string
  updatedAt: string
}

// DBから取得したレコードの型
export interface MangaRow {
  id: number
  title: string
  url: string
  schedule_type: string
  day_of_week: number | null
  monthly_days: string | null
  base_date: string | null
  created_at: string
  updated_at: string
}

// snake_case -> camelCase 変換
export function toManga(row: MangaRow): Manga {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    scheduleType: row.schedule_type as ScheduleType,
    dayOfWeek: row.day_of_week,
    monthlyDays: row.monthly_days ? JSON.parse(row.monthly_days) : null,
    baseDate: row.base_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

// バリデーション成功時の戻り値
interface ValidationSuccess {
  valid: true
  title: string
  url: string
  scheduleType: ScheduleType
  dayOfWeek: number | null
  monthlyDays: number[] | null
  baseDate: string | null
}

// バリデーション失敗時の戻り値
interface ValidationError {
  valid: false
  error: string
}

// バリデーション関数
export function validateMangaInput(data: unknown): ValidationSuccess | ValidationError {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid request body' }
  }

  const { title, url, scheduleType, dayOfWeek, monthlyDays } = data as Record<string, unknown>

  // title バリデーション
  if (typeof title !== 'string' || title.trim() === '') {
    return { valid: false, error: 'title is required' }
  }

  // url バリデーション
  if (typeof url !== 'string' || url.trim() === '') {
    return { valid: false, error: 'url is required' }
  }

  // scheduleType バリデーション
  if (scheduleType !== 'weekly' && scheduleType !== 'biweekly' && scheduleType !== 'monthly') {
    return { valid: false, error: 'scheduleType must be "weekly", "biweekly", or "monthly"' }
  }

  // scheduleType別のバリデーション
  if (scheduleType === 'weekly' || scheduleType === 'biweekly') {
    // weekly/biweekly: dayOfWeekが必須
    if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
      return { valid: false, error: 'dayOfWeek must be between 0 and 6 for weekly/biweekly schedule' }
    }

    // biweeklyの場合、baseDateは新規登録時に自動設定される（ここではnullを返す）
    return {
      valid: true,
      title: title.trim(),
      url: url.trim(),
      scheduleType,
      dayOfWeek,
      monthlyDays: null,
      baseDate: null
    }
  } else {
    // monthly: monthlyDaysが必須
    if (!Array.isArray(monthlyDays) || monthlyDays.length === 0) {
      return { valid: false, error: 'monthlyDays is required and must not be empty for monthly schedule' }
    }

    // monthlyDaysの各要素が1-31の範囲かチェック
    for (const day of monthlyDays) {
      if (typeof day !== 'number' || day < 1 || day > 31) {
        return { valid: false, error: 'monthlyDays must contain numbers between 1 and 31' }
      }
    }

    return {
      valid: true,
      title: title.trim(),
      url: url.trim(),
      scheduleType,
      dayOfWeek: null,
      monthlyDays,
      baseDate: null
    }
  }
}

// 現在日付をYYYY-MM-DD形式で取得
function getCurrentDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// GET /api/mangas - 漫画一覧取得
export async function getMangasHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM mangas ORDER BY id DESC').all<MangaRow>()
  const mangas = (result.results || []).map(toManga)
  return c.json({ mangas })
}

// POST /api/mangas - 漫画追加
export async function postMangaHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const body = await c.req.json()
  const validation = validateMangaInput(body)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const { title, url, scheduleType, dayOfWeek, monthlyDays } = validation
  const db = c.env.DB
  const now = new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)

  // biweeklyの場合、baseDateに現在日付を設定
  const baseDate = scheduleType === 'biweekly' ? getCurrentDate() : null
  const monthlyDaysJson = monthlyDays ? JSON.stringify(monthlyDays) : null

  const result = await db
    .prepare(
      `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(title, url, scheduleType, dayOfWeek, monthlyDaysJson, baseDate, now, now)
    .first<MangaRow>()

  if (!result) {
    return c.json({ error: 'Failed to create manga' }, 500)
  }

  return c.json({ manga: toManga(result) }, 201)
}

// PUT /api/mangas/:id - 漫画更新
export async function putMangaHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const id = c.req.param('id')
  const body = await c.req.json()
  const validation = validateMangaInput(body)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const { title, url, scheduleType, dayOfWeek, monthlyDays } = validation
  const db = c.env.DB

  // 存在確認と既存データ取得
  const existing = await db
    .prepare('SELECT * FROM mangas WHERE id = ?')
    .bind(id)
    .first<MangaRow>()

  if (!existing) {
    return c.json({ error: 'Manga not found' }, 404)
  }

  const now = new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)

  // biweeklyに変更される場合、既存のbaseDateがなければ現在日付を設定
  let baseDate: string | null = null
  if (scheduleType === 'biweekly') {
    baseDate = existing.base_date || getCurrentDate()
  }

  const monthlyDaysJson = monthlyDays ? JSON.stringify(monthlyDays) : null

  const result = await db
    .prepare(
      `UPDATE mangas
       SET title = ?, url = ?, schedule_type = ?, day_of_week = ?, monthly_days = ?, base_date = ?, updated_at = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(title, url, scheduleType, dayOfWeek, monthlyDaysJson, baseDate, now, id)
    .first<MangaRow>()

  if (!result) {
    return c.json({ error: 'Failed to update manga' }, 500)
  }

  return c.json({ manga: toManga(result) })
}

// DELETE /api/mangas/:id - 漫画削除
export async function deleteMangaHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const id = c.req.param('id')
  const db = c.env.DB

  // 存在確認
  const existing = await db.prepare('SELECT id FROM mangas WHERE id = ?').bind(id).first()
  if (!existing) {
    return c.json({ error: 'Manga not found' }, 404)
  }

  await db.prepare('DELETE FROM mangas WHERE id = ?').bind(id).run()

  return c.json({ success: true })
}
