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
      <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <form method="post" action="/settings" class="space-y-6">
          <div>
            <label for="slackWebhookUrl" class="block text-sm font-medium text-gray-700">
              Slack Webhook URL
            </label>
            <input
              type="url"
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              value={slackWebhookUrl}
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p class="mt-2 text-sm text-gray-500">
              Slack Incoming Webhook URLを入力してください
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
        <div class="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          Slack Webhook URLは必須です
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <form method="post" action="/settings" class="space-y-6">
            <div>
              <label for="slackWebhookUrl" class="block text-sm font-medium text-gray-700">
                Slack Webhook URL
              </label>
              <input
                type="url"
                id="slackWebhookUrl"
                name="slackWebhookUrl"
                value=""
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://hooks.slack.com/services/..."
              />
              <p class="mt-2 text-sm text-gray-500">
                Slack Incoming Webhook URLを入力してください
              </p>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
      <div class="bg-green-50 text-green-700 p-4 rounded-md mb-4">設定を保存しました</div>
      <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <form method="post" action="/settings" class="space-y-6">
          <div>
            <label for="slackWebhookUrl" class="block text-sm font-medium text-gray-700">
              Slack Webhook URL
            </label>
            <input
              type="url"
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              value={slackWebhookUrl.trim()}
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p class="mt-2 text-sm text-gray-500">
              Slack Incoming Webhook URLを入力してください
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
})
