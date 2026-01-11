import type { Context } from 'hono'

const SLACK_WEBHOOK_URL_KEY = 'slack_webhook_url'

// バリデーション関数
export function validateSettingsInput(
  data: unknown
): { valid: true; slackWebhookUrl: string } | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid request body' }
  }

  const { slackWebhookUrl } = data as Record<string, unknown>

  if (typeof slackWebhookUrl !== 'string' || slackWebhookUrl.trim() === '') {
    return { valid: false, error: 'slackWebhookUrl is required' }
  }

  return { valid: true, slackWebhookUrl: slackWebhookUrl.trim() }
}

// GET /api/settings - 設定取得
export async function getSettingsHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const db = c.env.DB
  const result = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SLACK_WEBHOOK_URL_KEY)
    .first<{ value: string }>()

  return c.json({ slackWebhookUrl: result?.value || '' })
}

// POST /api/settings - 設定保存
export async function postSettingsHandler(c: Context<{ Bindings: { DB: D1Database } }>) {
  const body = await c.req.json()
  const validation = validateSettingsInput(body)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const { slackWebhookUrl } = validation
  const db = c.env.DB

  // UPSERT: 存在すれば更新、なければ挿入
  await db
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .bind(SLACK_WEBHOOK_URL_KEY, slackWebhookUrl)
    .run()

  return c.json({ success: true })
}
