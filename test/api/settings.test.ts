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

// テスト用ヘルパー：settingsテーブルをクリア
async function clearSettings() {
  await env.DB.prepare('DELETE FROM settings').run()
}

describe('GET /api/settings', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearSettings()
  })

  it('設定がない場合は空文字を返す', async () => {
    const response = await SELF.fetch('http://localhost/api/settings')
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ slackWebhookUrl: '' })
  })

  it('保存済みのSlack Webhook URLを返す', async () => {
    // テストデータを挿入
    await env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)`
    )
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/xxx/yyy/zzz')
      .run()

    const response = await SELF.fetch('http://localhost/api/settings')
    expect(response.status).toBe(200)
    const data = (await response.json()) as { slackWebhookUrl: string }
    expect(data.slackWebhookUrl).toBe('https://hooks.slack.com/services/xxx/yyy/zzz')
  })
})

describe('POST /api/settings', () => {
  beforeAll(async () => {
    await applyMigrations()
  })

  beforeEach(async () => {
    await clearSettings()
  })

  it('Slack Webhook URLを保存する', async () => {
    const response = await SELF.fetch('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slackWebhookUrl: 'https://hooks.slack.com/services/xxx/yyy/zzz'
      })
    })

    expect(response.status).toBe(200)
    const data = (await response.json()) as { success: boolean }
    expect(data).toEqual({ success: true })

    // DBに保存されていることを確認
    const saved = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('slack_webhook_url').first<{ value: string }>()
    expect(saved?.value).toBe('https://hooks.slack.com/services/xxx/yyy/zzz')
  })

  it('既存のSlack Webhook URLを更新する', async () => {
    // 既存データを挿入
    await env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)`
    )
      .bind('slack_webhook_url', 'https://hooks.slack.com/services/old/old/old')
      .run()

    const response = await SELF.fetch('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slackWebhookUrl: 'https://hooks.slack.com/services/new/new/new'
      })
    })

    expect(response.status).toBe(200)
    const data = (await response.json()) as { success: boolean }
    expect(data).toEqual({ success: true })

    // DBが更新されていることを確認
    const saved = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('slack_webhook_url').first<{ value: string }>()
    expect(saved?.value).toBe('https://hooks.slack.com/services/new/new/new')
  })

  it('slackWebhookUrlが空の場合は400エラー', async () => {
    const response = await SELF.fetch('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slackWebhookUrl: ''
      })
    })

    expect(response.status).toBe(400)
    const data = (await response.json()) as { error: string }
    expect(data.error).toBe('slackWebhookUrl is required')
  })

  it('slackWebhookUrlが未定義の場合は400エラー', async () => {
    const response = await SELF.fetch('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    expect(response.status).toBe(400)
    const data = (await response.json()) as { error: string }
    expect(data.error).toBe('slackWebhookUrl is required')
  })

  it('空白のみのslackWebhookUrlは400エラー', async () => {
    const response = await SELF.fetch('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slackWebhookUrl: '   '
      })
    })

    expect(response.status).toBe(400)
    const data = (await response.json()) as { error: string }
    expect(data.error).toBe('slackWebhookUrl is required')
  })
})
