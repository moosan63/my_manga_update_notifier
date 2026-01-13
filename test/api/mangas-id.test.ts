import { env, SELF } from 'cloudflare:test'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Manga, ScheduleType } from '../../app/lib/manga-handlers'

// テスト用ヘルパー：マイグレーションを適用
async function applyMigrations() {
  for (const migration of env.TEST_MIGRATIONS) {
    for (const query of migration.queries) {
      await env.DB.prepare(query).run()
    }
  }
}

// テスト用ヘルパー：テーブルをクリア
async function clearTables() {
  await env.DB.prepare('DELETE FROM mangas').run()
}

// テスト用ヘルパー：テストデータを挿入
async function insertTestManga(
  title: string,
  url: string,
  scheduleType: ScheduleType,
  dayOfWeek: number | null,
  monthlyDays: number[] | null = null,
  baseDate: string | null = null
): Promise<number> {
  const result = await env.DB.prepare(
    `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
     RETURNING id`
  )
    .bind(title, url, scheduleType, dayOfWeek, monthlyDays ? JSON.stringify(monthlyDays) : null, baseDate)
    .first<{ id: number }>()
  return result!.id
}

describe('PUT /api/mangas/:id', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearTables()
  })

  describe('週次スケジュール', () => {
    it('週次漫画を更新する', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ONE PIECE',
          url: 'https://example.com/one-piece',
          scheduleType: 'weekly',
          dayOfWeek: 2
        })
      })

      expect(response.status).toBe(200)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.id).toBe(id)
      expect(data.manga.title).toBe('ONE PIECE')
      expect(data.manga.url).toBe('https://example.com/one-piece')
      expect(data.manga.scheduleType).toBe('weekly')
      expect(data.manga.dayOfWeek).toBe(2)
      expect(data.manga.monthlyDays).toBeNull()
      expect(data.manga.baseDate).toBeNull()
    })

    it('週次でdayOfWeekがない場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ONE PIECE',
          url: 'https://example.com/one-piece',
          scheduleType: 'weekly'
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('隔週スケジュール', () => {
    it('週次から隔週に変更（baseDateが自動設定される）', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'biweekly',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(200)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('biweekly')
      expect(data.manga.dayOfWeek).toBe(1)
      expect(data.manga.baseDate).toBeDefined()
      expect(data.manga.baseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('隔週漫画を更新する（baseDateが既存の場合は保持）', async () => {
      const id = await insertTestManga('隔週漫画', 'https://example.com/biweekly', 'biweekly', 3, null, '2024-01-01')

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '隔週漫画更新',
          url: 'https://example.com/biweekly-updated',
          scheduleType: 'biweekly',
          dayOfWeek: 4
        })
      })

      expect(response.status).toBe(200)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('biweekly')
      expect(data.manga.dayOfWeek).toBe(4)
      // 既存のbaseDateが保持されること
      expect(data.manga.baseDate).toBe('2024-01-01')
    })

    it('隔週でdayOfWeekがない場合は400エラー', async () => {
      const id = await insertTestManga('隔週漫画', 'https://example.com/biweekly', 'biweekly', 3, null, '2024-01-01')

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '隔週漫画',
          url: 'https://example.com/biweekly',
          scheduleType: 'biweekly'
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('月次スケジュール', () => {
    it('週次から月次に変更', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'monthly',
          monthlyDays: [1, 15]
        })
      })

      expect(response.status).toBe(200)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('monthly')
      expect(data.manga.dayOfWeek).toBeNull()
      expect(data.manga.monthlyDays).toEqual([1, 15])
    })

    it('月次漫画を更新する', async () => {
      const id = await insertTestManga('月刊漫画', 'https://example.com/monthly', 'monthly', null, [1, 15])

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画更新',
          url: 'https://example.com/monthly-updated',
          scheduleType: 'monthly',
          monthlyDays: [5, 20, 25]
        })
      })

      expect(response.status).toBe(200)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('monthly')
      expect(data.manga.monthlyDays).toEqual([5, 20, 25])
    })

    it('月次でmonthlyDaysがない場合は400エラー', async () => {
      const id = await insertTestManga('月刊漫画', 'https://example.com/monthly', 'monthly', null, [1, 15])

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画',
          url: 'https://example.com/monthly',
          scheduleType: 'monthly'
        })
      })

      expect(response.status).toBe(400)
    })

    it('月次でmonthlyDaysが空配列の場合は400エラー', async () => {
      const id = await insertTestManga('月刊漫画', 'https://example.com/monthly', 'monthly', null, [1, 15])

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画',
          url: 'https://example.com/monthly',
          scheduleType: 'monthly',
          monthlyDays: []
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('共通バリデーション', () => {
    it('存在しないIDに対しては404を返す', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas/9999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(404)
    })

    it('titleが空の場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(400)
    })

    it('urlが空の場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: '',
          scheduleType: 'weekly',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(400)
    })

    it('scheduleTypeがない場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(400)
    })

    it('scheduleTypeが不正な場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'invalid',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(400)
    })

    it('dayOfWeekが範囲外の場合は400エラー', async () => {
      const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

      const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly',
          dayOfWeek: 7
        })
      })

      expect(response.status).toBe(400)
    })
  })
})

describe('DELETE /api/mangas/:id', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearTables()
  })

  it('漫画を削除する', async () => {
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 'weekly', 1)

    const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
      method: 'DELETE'
    })

    expect(response.status).toBe(200)
    const data = (await response.json()) as { success: boolean }
    expect(data.success).toBe(true)

    // 削除されていることを確認
    const checkResponse = await SELF.fetch('http://localhost/api/mangas')
    const checkData = (await checkResponse.json()) as { mangas: unknown[] }
    expect(checkData.mangas).toHaveLength(0)
  })

  it('存在しないIDに対しては404を返す', async () => {
    const response = await SELF.fetch('http://localhost/api/mangas/9999', {
      method: 'DELETE'
    })

    expect(response.status).toBe(404)
  })
})
