import { env } from 'cloudflare:test'
import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from 'vitest'
import { handleScheduled, getJSTDayOfWeek } from '../../app/lib/cron-handler'

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
  await env.DB.prepare('DELETE FROM settings').run()
}

describe('getJSTDayOfWeek', () => {
  it('UTCの時刻からJSTの曜日を取得する', () => {
    // 2024年1月1日 15:00 UTC = 2024年1月2日 0:00 JST（火曜日）
    const date = new Date('2024-01-01T15:00:00Z')
    expect(getJSTDayOfWeek(date)).toBe(2) // 火曜日
  })

  it('日付が変わらない場合（UTC 14:59以前）', () => {
    // 2024年1月1日 14:59 UTC = 2024年1月1日 23:59 JST（月曜日）
    const date = new Date('2024-01-01T14:59:00Z')
    expect(getJSTDayOfWeek(date)).toBe(1) // 月曜日
  })

  it('土曜日から日曜日への切り替え', () => {
    // 2024年1月6日（土）15:00 UTC = 2024年1月7日（日）0:00 JST
    const date = new Date('2024-01-06T15:00:00Z')
    expect(getJSTDayOfWeek(date)).toBe(0) // 日曜日
  })
})

describe('handleScheduled', () => {
  const originalFetch = globalThis.fetch

  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearTables()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('Webhook URLが設定されていない場合は何もしない', async () => {
    const mockFetch = vi.fn()
    globalThis.fetch = mockFetch

    // 漫画を登録（月曜日）
    await env.DB.prepare(
      'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    // 月曜日の0:00 JSTとして実行
    const scheduledTime = new Date('2024-01-01T15:00:00Z') // UTC 15:00 = JST 0:00 火曜日だが、月曜日にする
    const mondayTime = new Date('2024-01-01T14:00:00Z') // UTC 14:00 = JST 23:00 月曜日

    await handleScheduled(env.DB, mondayTime)

    // fetchが呼ばれないことを確認
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('該当曜日の漫画がない場合は何もしない', async () => {
    const mockFetch = vi.fn()
    globalThis.fetch = mockFetch

    // Webhook URLを設定
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    // 火曜日の漫画を登録
    await env.DB.prepare(
      'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind('ワンピース', 'https://example.com/onepiece', 2, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    // 月曜日として実行（火曜日の漫画は対象外）
    const mondayTime = new Date('2024-01-01T00:00:00Z') // 月曜日（JST 09:00）

    await handleScheduled(env.DB, mondayTime)

    // fetchが呼ばれないことを確認
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('該当曜日の漫画にSlack通知を送信する', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    globalThis.fetch = mockFetch

    // Webhook URLを設定
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    // 月曜日の漫画を登録
    await env.DB.prepare(
      'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
      .run()

    // 月曜日として実行
    const mondayTime = new Date('2024-01-01T00:00:00Z') // 2024-01-01は月曜日

    await handleScheduled(env.DB, mondayTime)

    // fetchが1回呼ばれることを確認
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/xxx/yyy/zzz',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    )

    // 送信内容を確認
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.attachments[0].title).toBe('ワンピース')
    expect(body.attachments[0].title_link).toBe('https://example.com/onepiece')
  })

  it('複数の該当漫画それぞれに通知を送信する', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    globalThis.fetch = mockFetch

    // Webhook URLを設定
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    // 月曜日の漫画を2つ登録
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      env.DB.prepare(
        'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind('呪術廻戦', 'https://example.com/jjk', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
    ])

    // 月曜日として実行
    const mondayTime = new Date('2024-01-01T00:00:00Z')

    await handleScheduled(env.DB, mondayTime)

    // fetchが2回呼ばれることを確認
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('通知エラーが発生しても他の漫画の通知は続行する', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 }) // 1つ目は失敗
      .mockResolvedValueOnce({ ok: true, status: 200 }) // 2つ目は成功

    globalThis.fetch = mockFetch

    // Webhook URLを設定
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    // 月曜日の漫画を2つ登録
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind('ワンピース', 'https://example.com/onepiece', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
      env.DB.prepare(
        'INSERT INTO mangas (title, url, day_of_week, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind('呪術廻戦', 'https://example.com/jjk', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
    ])

    // 月曜日として実行
    const mondayTime = new Date('2024-01-01T00:00:00Z')

    // エラーがスローされないことを確認
    await expect(handleScheduled(env.DB, mondayTime)).resolves.not.toThrow()

    // fetchが2回呼ばれることを確認
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
