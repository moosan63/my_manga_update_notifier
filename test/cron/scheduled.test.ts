import { env } from 'cloudflare:test'
import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from 'vitest'
import { handleScheduled } from '../../app/lib/cron-handler'

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

// テスト用ヘルパー：漫画を登録
async function insertManga(data: {
  title: string
  url: string
  scheduleType: 'weekly' | 'biweekly' | 'monthly'
  dayOfWeek?: number | null
  monthlyDays?: number[] | null
  baseDate?: string | null
}) {
  const now = '2024-01-01 00:00:00'
  await env.DB.prepare(
    `INSERT INTO mangas (title, url, schedule_type, day_of_week, monthly_days, base_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      data.title,
      data.url,
      data.scheduleType,
      data.dayOfWeek ?? null,
      data.monthlyDays ? JSON.stringify(data.monthlyDays) : null,
      data.baseDate ?? null,
      now,
      now
    )
    .run()
}

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

    // 週次の漫画を登録（月曜日）
    await insertManga({
      title: 'ワンピース',
      url: 'https://example.com/onepiece',
      scheduleType: 'weekly',
      dayOfWeek: 1
    })

    // 月曜日として実行
    const mondayTime = new Date('2024-01-01T00:00:00Z') // 2024-01-01はJSTで月曜日

    await handleScheduled(env.DB, mondayTime)

    // fetchが呼ばれないことを確認
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('該当する漫画がない場合は何もしない', async () => {
    const mockFetch = vi.fn()
    globalThis.fetch = mockFetch

    // Webhook URLを設定
    await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    // 火曜日の漫画を登録
    await insertManga({
      title: 'ワンピース',
      url: 'https://example.com/onepiece',
      scheduleType: 'weekly',
      dayOfWeek: 2
    })

    // 月曜日として実行（火曜日の漫画は対象外）
    const mondayTime = new Date('2024-01-01T00:00:00Z') // 2024-01-01はJSTで月曜日

    await handleScheduled(env.DB, mondayTime)

    // fetchが呼ばれないことを確認
    expect(mockFetch).not.toHaveBeenCalled()
  })

  describe('週次スケジュール', () => {
    it('該当曜日の漫画にSlack通知を送信する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 月曜日の週次漫画を登録
      await insertManga({
        title: 'ワンピース',
        url: 'https://example.com/onepiece',
        scheduleType: 'weekly',
        dayOfWeek: 1
      })

      // 月曜日として実行
      const mondayTime = new Date('2024-01-01T00:00:00Z') // 2024-01-01はJSTで月曜日

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
  })

  describe('隔週スケジュール', () => {
    it('基準日の週（偶数週）に通知を送信する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 隔週の漫画を登録（月曜日、基準日は2024-01-01）
      await insertManga({
        title: '隔週漫画',
        url: 'https://example.com/biweekly',
        scheduleType: 'biweekly',
        dayOfWeek: 1,
        baseDate: '2024-01-01'
      })

      // 基準日当日（偶数週の0週目）として実行
      const baseDayTime = new Date('2024-01-01T00:00:00Z') // JST月曜日

      await handleScheduled(env.DB, baseDayTime)

      // fetchが1回呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('奇数週には通知しない', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 隔週の漫画を登録（月曜日、基準日は2024-01-01）
      await insertManga({
        title: '隔週漫画',
        url: 'https://example.com/biweekly',
        scheduleType: 'biweekly',
        dayOfWeek: 1,
        baseDate: '2024-01-01'
      })

      // 1週間後（奇数週）の月曜日として実行
      const oddWeekTime = new Date('2024-01-08T00:00:00Z') // JST月曜日、1週目

      await handleScheduled(env.DB, oddWeekTime)

      // fetchが呼ばれないことを確認
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('2週間後（偶数週）に通知を送信する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 隔週の漫画を登録（月曜日、基準日は2024-01-01）
      await insertManga({
        title: '隔週漫画',
        url: 'https://example.com/biweekly',
        scheduleType: 'biweekly',
        dayOfWeek: 1,
        baseDate: '2024-01-01'
      })

      // 2週間後（偶数週の2週目）として実行
      const evenWeekTime = new Date('2024-01-15T00:00:00Z') // JST月曜日、2週目

      await handleScheduled(env.DB, evenWeekTime)

      // fetchが1回呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('月次スケジュール', () => {
    it('指定日に通知を送信する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 月次の漫画を登録（毎月15日）
      await insertManga({
        title: '月刊漫画',
        url: 'https://example.com/monthly',
        scheduleType: 'monthly',
        monthlyDays: [15]
      })

      // 15日として実行
      const day15Time = new Date('2024-01-15T00:00:00Z') // JST 1月15日

      await handleScheduled(env.DB, day15Time)

      // fetchが1回呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('指定日以外には通知しない', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 月次の漫画を登録（毎月15日）
      await insertManga({
        title: '月刊漫画',
        url: 'https://example.com/monthly',
        scheduleType: 'monthly',
        monthlyDays: [15]
      })

      // 14日として実行
      const day14Time = new Date('2024-01-14T00:00:00Z') // JST 1月14日

      await handleScheduled(env.DB, day14Time)

      // fetchが呼ばれないことを確認
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('複数の指定日がある場合、いずれかに該当すれば通知する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 月次の漫画を登録（毎月1日と15日）
      await insertManga({
        title: '月刊漫画',
        url: 'https://example.com/monthly',
        scheduleType: 'monthly',
        monthlyDays: [1, 15]
      })

      // 1日として実行
      const day1Time = new Date('2024-01-01T00:00:00Z') // JST 1月1日

      await handleScheduled(env.DB, day1Time)

      // fetchが1回呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('複数スケジュールタイプの混合', () => {
    it('複数の漫画それぞれに通知を送信する', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 週次の漫画を登録（月曜日）
      await insertManga({
        title: '週刊漫画',
        url: 'https://example.com/weekly',
        scheduleType: 'weekly',
        dayOfWeek: 1
      })

      // 月次の漫画を登録（毎月1日）
      await insertManga({
        title: '月刊漫画',
        url: 'https://example.com/monthly',
        scheduleType: 'monthly',
        monthlyDays: [1]
      })

      // 2024-01-01は月曜日かつ1日
      const mondayDay1Time = new Date('2024-01-01T00:00:00Z') // JST月曜日・1月1日

      await handleScheduled(env.DB, mondayDay1Time)

      // fetchが2回呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('対象外の漫画には通知しない', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
      globalThis.fetch = mockFetch

      // Webhook URLを設定
      await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
        .run()

      // 週次の漫画を登録（火曜日 - 対象外）
      await insertManga({
        title: '週刊漫画（火曜）',
        url: 'https://example.com/weekly-tue',
        scheduleType: 'weekly',
        dayOfWeek: 2
      })

      // 週次の漫画を登録（月曜日 - 対象）
      await insertManga({
        title: '週刊漫画（月曜）',
        url: 'https://example.com/weekly-mon',
        scheduleType: 'weekly',
        dayOfWeek: 1
      })

      // 月曜日として実行
      const mondayTime = new Date('2024-01-01T00:00:00Z')

      await handleScheduled(env.DB, mondayTime)

      // fetchが1回だけ呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.attachments[0].title).toBe('週刊漫画（月曜）')
    })
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
    await insertManga({
      title: 'ワンピース',
      url: 'https://example.com/onepiece',
      scheduleType: 'weekly',
      dayOfWeek: 1
    })
    await insertManga({
      title: '呪術廻戦',
      url: 'https://example.com/jjk',
      scheduleType: 'weekly',
      dayOfWeek: 1
    })

    // 月曜日として実行
    const mondayTime = new Date('2024-01-01T00:00:00Z')

    // エラーがスローされないことを確認
    await expect(handleScheduled(env.DB, mondayTime)).resolves.not.toThrow()

    // fetchが2回呼ばれることを確認
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
