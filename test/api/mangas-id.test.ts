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

// テスト用ヘルパー：テストデータを挿入
async function insertTestManga(
  title: string,
  url: string,
  dayOfWeek: number
): Promise<number> {
  const result = await env.DB.prepare(
    `INSERT INTO mangas (title, url, day_of_week, created_at, updated_at)
     VALUES (?, ?, ?, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
     RETURNING id`
  )
    .bind(title, url, dayOfWeek)
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

  it('漫画を更新する', async () => {
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 1)

    const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'ONE PIECE',
        url: 'https://example.com/one-piece',
        dayOfWeek: 2
      })
    })

    expect(response.status).toBe(200)
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
    expect(data.manga.id).toBe(id)
    expect(data.manga.title).toBe('ONE PIECE')
    expect(data.manga.url).toBe('https://example.com/one-piece')
    expect(data.manga.dayOfWeek).toBe(2)
  })

  it('存在しないIDに対しては404を返す', async () => {
    const response = await SELF.fetch('http://localhost/api/mangas/9999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'ワンピース',
        url: 'https://example.com/onepiece',
        dayOfWeek: 1
      })
    })

    expect(response.status).toBe(404)
  })

  it('titleが空の場合は400エラー', async () => {
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 1)

    const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
      method: 'PUT',
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
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 1)

    const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
      method: 'PUT',
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
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 1)

    const response = await SELF.fetch(`http://localhost/api/mangas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'ワンピース',
        url: 'https://example.com/onepiece',
        dayOfWeek: 7
      })
    })

    expect(response.status).toBe(400)
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
    const id = await insertTestManga('ワンピース', 'https://example.com/onepiece', 1)

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
