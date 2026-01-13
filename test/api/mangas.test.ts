import { env, SELF } from 'cloudflare:test'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Manga } from '../../app/lib/manga-handlers'

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

describe('GET /api/mangas', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearTables()
  })

  it('空のリストを返す（漫画が登録されていない場合）', async () => {
    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ mangas: [] })
  })

  it('登録済みの漫画一覧を返す（週次）', async () => {
    // テストデータを挿入
    await env.DB.prepare(
      `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind('ワンピース', 'https://example.com/onepiece', 'weekly', 1, null, null, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as { mangas: Manga[] }
    expect(data.mangas).toHaveLength(1)
    expect(data.mangas[0].title).toBe('ワンピース')
    expect(data.mangas[0].url).toBe('https://example.com/onepiece')
    expect(data.mangas[0].scheduleType).toBe('weekly')
    expect(data.mangas[0].dayOfWeek).toBe(1)
    expect(data.mangas[0].monthlyDays).toBeNull()
    expect(data.mangas[0].baseDate).toBeNull()
  })

  it('登録済みの漫画一覧を返す（月次）', async () => {
    await env.DB.prepare(
      `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind('月刊漫画', 'https://example.com/monthly', 'monthly', null, JSON.stringify([1, 15]), null, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as { mangas: Manga[] }
    expect(data.mangas).toHaveLength(1)
    expect(data.mangas[0].scheduleType).toBe('monthly')
    expect(data.mangas[0].dayOfWeek).toBeNull()
    expect(data.mangas[0].monthlyDays).toEqual([1, 15])
  })

  it('登録済みの漫画一覧を返す（隔週）', async () => {
    await env.DB.prepare(
      `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind('隔週漫画', 'https://example.com/biweekly', 'biweekly', 3, null, '2024-01-01', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as { mangas: Manga[] }
    expect(data.mangas).toHaveLength(1)
    expect(data.mangas[0].scheduleType).toBe('biweekly')
    expect(data.mangas[0].dayOfWeek).toBe(3)
    expect(data.mangas[0].baseDate).toBe('2024-01-01')
  })

  it('複数の漫画を返す', async () => {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO mangas (title, url, schedule_type, day_of_week, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind('ワンピース', 'https://example.com/onepiece', 'weekly', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      env.DB.prepare(
        `INSERT INTO mangas (title, url, schedule_type, day_of_week, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind('呪術廻戦', 'https://example.com/jjk', 'weekly', 0, '2024-01-02 00:00:00', '2024-01-02 00:00:00')
    ])

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as { mangas: Manga[] }
    expect(data.mangas).toHaveLength(2)
  })
})

describe('POST /api/mangas', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearTables()
  })

  // 週次スケジュールのテスト
  describe('週次スケジュール', () => {
    it('週次漫画を追加する', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly',
          dayOfWeek: 1
        })
      })

      expect(response.status).toBe(201)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.title).toBe('ワンピース')
      expect(data.manga.url).toBe('https://example.com/onepiece')
      expect(data.manga.scheduleType).toBe('weekly')
      expect(data.manga.dayOfWeek).toBe(1)
      expect(data.manga.monthlyDays).toBeNull()
      expect(data.manga.baseDate).toBeNull()
      expect(data.manga.id).toBeDefined()
      expect(data.manga.createdAt).toBeDefined()
      expect(data.manga.updatedAt).toBeDefined()
    })

    it('週次でdayOfWeekがない場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly'
        })
      })

      expect(response.status).toBe(400)
      const data = (await response.json()) as { error: string }
      expect(data.error).toContain('dayOfWeek')
    })
  })

  // 隔週スケジュールのテスト
  describe('隔週スケジュール', () => {
    it('隔週漫画を追加する（baseDateは自動設定）', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '隔週漫画',
          url: 'https://example.com/biweekly',
          scheduleType: 'biweekly',
          dayOfWeek: 3
        })
      })

      expect(response.status).toBe(201)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('biweekly')
      expect(data.manga.dayOfWeek).toBe(3)
      expect(data.manga.baseDate).toBeDefined()
      // baseDateはYYYY-MM-DD形式であること
      expect(data.manga.baseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('隔週でdayOfWeekがない場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '隔週漫画',
          url: 'https://example.com/biweekly',
          scheduleType: 'biweekly'
        })
      })

      expect(response.status).toBe(400)
      const data = (await response.json()) as { error: string }
      expect(data.error).toContain('dayOfWeek')
    })
  })

  // 月次スケジュールのテスト
  describe('月次スケジュール', () => {
    it('月次漫画を追加する', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画',
          url: 'https://example.com/monthly',
          scheduleType: 'monthly',
          monthlyDays: [1, 15]
        })
      })

      expect(response.status).toBe(201)
      const data = (await response.json()) as { manga: Manga }
      expect(data.manga.scheduleType).toBe('monthly')
      expect(data.manga.dayOfWeek).toBeNull()
      expect(data.manga.monthlyDays).toEqual([1, 15])
    })

    it('月次でmonthlyDaysがない場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画',
          url: 'https://example.com/monthly',
          scheduleType: 'monthly'
        })
      })

      expect(response.status).toBe(400)
      const data = (await response.json()) as { error: string }
      expect(data.error).toContain('monthlyDays')
    })

    it('月次でmonthlyDaysが空配列の場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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

    it('月次でmonthlyDaysが範囲外の場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '月刊漫画',
          url: 'https://example.com/monthly',
          scheduleType: 'monthly',
          monthlyDays: [0, 32]
        })
      })

      expect(response.status).toBe(400)
    })
  })

  // 共通バリデーションのテスト
  describe('共通バリデーション', () => {
    it('titleが空の場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
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

    it('dayOfWeekが負の場合は400エラー', async () => {
      const response = await SELF.fetch('http://localhost/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ワンピース',
          url: 'https://example.com/onepiece',
          scheduleType: 'weekly',
          dayOfWeek: -1
        })
      })

      expect(response.status).toBe(400)
    })
  })
})
