import { sendSlackNotification } from './slack'
import { shouldNotify } from './schedule-utils'
import { toManga, type MangaRow } from './manga-handlers'

const SLACK_WEBHOOK_URL_KEY = 'slack_webhook_url'

/**
 * スケジュールされたイベントを処理する
 * @param db D1データベースインスタンス
 * @param scheduledTime 実行時刻
 */
export async function handleScheduled(
  db: D1Database,
  scheduledTime: Date = new Date()
): Promise<void> {
  // 1. settingsからslack_webhook_urlを取得
  const settingsResult = await db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind(SLACK_WEBHOOK_URL_KEY)
    .first<{ value: string }>()

  const webhookUrl = settingsResult?.value
  if (!webhookUrl) {
    // Webhook URLが設定されていない場合は何もしない
    console.log('Slack Webhook URL is not configured. Skipping notifications.')
    return
  }

  // 2. D1から全漫画を取得
  const mangasResult = await db.prepare('SELECT * FROM mangas').all<MangaRow>()

  const rows = mangasResult.results || []
  if (rows.length === 0) {
    console.log('No manga registered. Skipping notifications.')
    return
  }

  // 3. shouldNotify()で通知対象をフィルタリング
  const mangas = rows.map(toManga)
  const mangasToNotify = mangas.filter((manga) => shouldNotify(manga, scheduledTime))

  if (mangasToNotify.length === 0) {
    console.log('No manga updates scheduled for today. Skipping notifications.')
    return
  }

  // 4. 各漫画についてSlackに通知
  console.log(`Sending notifications for ${mangasToNotify.length} manga(s)`)

  for (const manga of mangasToNotify) {
    try {
      const success = await sendSlackNotification(webhookUrl, {
        title: manga.title,
        url: manga.url
      })

      if (success) {
        console.log(`Successfully notified: ${manga.title}`)
      } else {
        console.error(`Failed to notify: ${manga.title}`)
      }
    } catch (error) {
      // エラーが発生しても他の漫画の通知は続行
      console.error(`Error notifying ${manga.title}:`, error)
    }
  }
}
