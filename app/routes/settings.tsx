import { createRoute } from 'honox/factory'
import { Layout } from '../components/Layout'

const SLACK_WEBHOOK_URL_KEY = 'slack_webhook_url'

// Slack Settings Form Component
const SlackSettingsForm = ({ slackWebhookUrl = '', successMessage = '', errorMessage = '' }) => {
  return (
    <div class="max-w-2xl mx-auto">
      {/* Header */}
      <div class="text-center mb-10">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-gaming-purple to-gaming-pink flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gaming-purple/30">
          <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gaming-text mb-3">
          通知をカスタマイズ
        </h2>
        <p class="text-gaming-text-muted max-w-md mx-auto">
          Slackと連携して、漫画の更新日にお知らせを受け取ろう
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div class="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 p-5 rounded-2xl mb-6 border border-emerald-500/30 flex items-center gap-4 animate-pulse-once">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-bold text-lg">設定完了!</p>
            <p class="text-emerald-400/80 text-sm">通知の準備が整いました</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div class="bg-gradient-to-r from-gaming-pink/20 to-rose-500/20 text-gaming-pink p-5 rounded-2xl mb-6 border border-gaming-pink/30 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gaming-pink/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-gaming-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-bold text-lg">おっと!</p>
            <p class="text-gaming-pink/80 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div class="bg-gaming-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gaming-purple/10 shadow-xl">
        {/* Slack explanation */}
        <div class="mb-8 p-5 bg-gaming-darker/50 rounded-2xl border border-gaming-purple/10">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-[#4A154B] flex items-center justify-center flex-shrink-0">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-gaming-text mb-1">Slackで通知を受け取る</h3>
              <p class="text-sm text-gaming-text-muted leading-relaxed">
                Slackの「Incoming Webhook」を使って、登録した漫画の更新日にチャンネルへ通知を送ります。
                <a href="https://slack.com/intl/ja-jp/help/articles/115005265063" target="_blank" rel="noopener noreferrer" class="text-gaming-cyan hover:text-gaming-cyan/80 transition-colors ml-1">
                  設定方法を見る
                </a>
              </p>
            </div>
          </div>
        </div>

        <form method="post" action="/settings" class="space-y-6">
          <div>
            <label for="slackWebhookUrl" class="block text-lg font-semibold text-gaming-text mb-3">
              Slack通知先
            </label>
            <input
              type="url"
              id="slackWebhookUrl"
              name="slackWebhookUrl"
              value={slackWebhookUrl}
              class="input-gaming block w-full rounded-2xl border-2 border-gaming-purple/20 bg-gaming-darker/80 px-5 py-4 text-lg text-gaming-text placeholder-gaming-text-muted/40 focus:border-gaming-purple focus:outline-none transition-all duration-300 focus:shadow-xl focus:shadow-gaming-purple/20 hover:border-gaming-purple/40"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p class="mt-3 text-sm text-gaming-text-muted/70">
              SlackのWebhook URLを貼り付けてね。通知を送りたいチャンネル用のURLを作成してください。
            </p>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="btn-gradient w-full text-white py-4 px-6 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-gaming-purple/50 focus:ring-offset-2 focus:ring-offset-gaming-dark flex items-center justify-center gap-3 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-gaming-purple/30 hover:shadow-2xl hover:shadow-gaming-purple/40"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>設定を保存する</span>
            </button>
          </div>
        </form>
      </div>

      {/* Help section */}
      <div class="mt-8 text-center">
        <p class="text-sm text-gaming-text-muted/60">
          困ったことがあったら、Slackの
          <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" class="text-gaming-cyan/60 hover:text-gaming-cyan transition-colors">
            公式ドキュメント
          </a>
          を参考にしてね
        </p>
      </div>
    </div>
  )
}

// GET /settings - 設定ページ表示
export default createRoute(async (c) => {
  const db = c.env.DB
  const result = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SLACK_WEBHOOK_URL_KEY)
    .first<{ value: string }>()

  const slackWebhookUrl = result?.value || ''

  return c.render(
    <Layout title="通知設定" showBackLink>
      <title>通知設定</title>
      <SlackSettingsForm slackWebhookUrl={slackWebhookUrl} />
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
      <Layout title="通知設定" showBackLink>
        <title>通知設定</title>
        <SlackSettingsForm
          slackWebhookUrl=""
          errorMessage="Slack通知先のURLを入力してください"
        />
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
    <Layout title="通知設定" showBackLink>
      <title>通知設定</title>
      <SlackSettingsForm
        slackWebhookUrl={slackWebhookUrl.trim()}
        successMessage="設定を保存しました"
      />
    </Layout>
  )
})
