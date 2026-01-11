import { createRoute } from 'honox/factory'
import { Layout } from '../components/Layout'

const SLACK_WEBHOOK_URL_KEY = 'slack_webhook_url'

// GET /settings - 設定ページ表示
export default createRoute(async (c) => {
  const db = c.env.DB
  const result = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SLACK_WEBHOOK_URL_KEY)
    .first<{ value: string }>()

  const slackWebhookUrl = result?.value || ''

  return c.render(
    <Layout title="設定" showBackLink>
      <title>設定</title>
      <div class="card-gaming bg-gaming-card rounded-lg p-6">
        <form method="post" action="/settings" class="space-y-6">
          <div>
            <label for="slackWebhookUrl" class="block text-sm font-medium text-gaming-text-muted mb-1">
              Slack Webhook URL
            </label>
            <input
              type="url"
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              value={slackWebhookUrl}
              class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p class="mt-2 text-sm text-gaming-text-muted/70">
              Slack Incoming Webhook URLを入力してください
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="btn-gradient w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:ring-offset-2 focus:ring-offset-gaming-dark"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
})

// POST /settings - 設定保存処理
export const POST = createRoute(async (c) => {
  const formData = await c.req.parseBody()
  const slackWebhookUrl = formData['slackWebhookUrl']

  // バリデーション
  if (typeof slackWebhookUrl !== 'string' || slackWebhookUrl.trim() === '') {
    return c.render(
      <Layout title="設定" showBackLink>
        <title>設定</title>
        <div class="bg-gaming-pink/20 text-gaming-pink p-4 rounded-lg mb-4 border border-gaming-pink/30">
          Slack Webhook URLは必須です
        </div>
        <div class="card-gaming bg-gaming-card rounded-lg p-6">
          <form method="post" action="/settings" class="space-y-6">
            <div>
              <label for="slackWebhookUrl" class="block text-sm font-medium text-gaming-text-muted mb-1">
                Slack Webhook URL
              </label>
              <input
                type="url"
                id="slackWebhookUrl"
                name="slackWebhookUrl"
                value=""
                class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none"
                placeholder="https://hooks.slack.com/services/..."
              />
              <p class="mt-2 text-sm text-gaming-text-muted/70">
                Slack Incoming Webhook URLを入力してください
              </p>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                class="btn-gradient w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:ring-offset-2 focus:ring-offset-gaming-dark"
              >
                保存する
              </button>
            </div>
          </form>
        </div>
      </Layout>
    )
  }

  const db = c.env.DB

  // UPSERT: 存在すれば更新、なければ挿入
  await db
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .bind(SLACK_WEBHOOK_URL_KEY, slackWebhookUrl.trim())
    .run()

  return c.render(
    <Layout title="設定" showBackLink>
      <title>設定</title>
      <div class="bg-gaming-cyan/20 text-gaming-cyan p-4 rounded-lg mb-4 border border-gaming-cyan/30">設定を保存しました</div>
      <div class="card-gaming bg-gaming-card rounded-lg p-6">
        <form method="post" action="/settings" class="space-y-6">
          <div>
            <label for="slackWebhookUrl" class="block text-sm font-medium text-gaming-text-muted mb-1">
              Slack Webhook URL
            </label>
            <input
              type="url"
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              value={slackWebhookUrl.trim()}
              class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p class="mt-2 text-sm text-gaming-text-muted/70">
              Slack Incoming Webhook URLを入力してください
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="btn-gradient w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:ring-offset-2 focus:ring-offset-gaming-dark"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
})
