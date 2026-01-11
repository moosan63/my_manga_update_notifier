import { env, SELF } from 'cloudflare:test'
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'

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

  it('登録済みの漫画一覧を返す', async () => {
    // テストデータを挿入
    await env.DB.prepare(
      `INSERT INTO mangas (title, url, day_of_week, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as {
      mangas: Array<{
        id: number
        title: string
        url: string
        dayOfWeek: number
        createdAt: string
        updatedAt: string
      }>
    }
    expect(data.mangas).toHaveLength(1)
    expect(data.mangas[0].title).toBe('ワンピース')
    expect(data.mangas[0].url).toBe('https://example.com/onepiece')
    expect(data.mangas[0].dayOfWeek).toBe(1)
  })

  it('複数の漫画を返す', async () => {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO mangas (title, url, day_of_week, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      env.DB.prepare(
        `INSERT INTO mangas (title, url, day_of_week, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind('呪術廻戦', 'https://example.com/jjk', 0, '2024-01-02 00:00:00', '2024-01-02 00:00:00')
    ])

    const response = await SELF.fetch('http://localhost/api/mangas')
    expect(response.status).toBe(200)
    const data = (await response.json()) as {
      mangas: Array<{
        id: number
        title: string
      }>
    }
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

  it('新しい漫画を追加する', async () => {
    const response = await SELF.fetch('http://localhost/api/mangas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'ワンピース',
        url: 'https://example.com/onepiece',
        dayOfWeek: 1
      })
    })

    expect(response.status).toBe(201)
    const data = (await response.json()) as {
      manga: {
        id: number
        title: string
        url: string
        dayOfWeek: number
        createdAt: string
        updatedAt: string
      }
    }
    expect(data.manga.title).toBe('ワンピース')
    expect(data.manga.url).toBe('https://example.com/onepiece')
    expect(data.manga.dayOfWeek).toBe(1)
    expect(data.manga.id).toBeDefined()
    expect(data.manga.createdAt).toBeDefined()
    expect(data.manga.updatedAt).toBeDefined()
  })

  it('titleが空の場合は400エラー', async () => {
    const response = await SELF.fetch('http://localhost/api/mangas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        url: 'https://example.com/onepiece',
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
        dayOfWeek: -1
      })
    })

    expect(response.status).toBe(400)
  })
})
