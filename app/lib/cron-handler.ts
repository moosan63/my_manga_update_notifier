import { sendSlackNotification } from './slack'

// DBから取得したレコードの型
interface MangaRow {
  id: number
  title: string
  url: string
  day_of_week: number
  created_at: string
  updated_at: string
}

const SLACK_WEBHOOK_URL_KEY = 'slack_webhook_url'

/**
 * UTCの日時からJSTの曜日を取得する
 * UTC + 9時間 = JST
 * @param date 日時（UTC）
 * @returns 曜日（0=日, 1=月, ..., 6=土）
 */
export function getJSTDayOfWeek(date: Date): number {
  // JSTはUTC+9
  const jstOffset = 9 * 60 * 60 * 1000
  const jstDate = new Date(date.getTime() + jstOffset)
  return jstDate.getUTCDay()
}

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

  // 2. 現在の曜日を取得（JST）
  const dayOfWeek = getJSTDayOfWeek(scheduledTime)

  // 3. D1から該当曜日の漫画を取得
  const mangasResult = await db
    .prepare('SELECT * FROM mangas WHERE day_of_week = ?')
    .bind(dayOfWeek)
    .all<MangaRow>()

  const mangas = mangasResult.results || []
  if (mangas.length === 0) {
    console.log(`No manga updates scheduled for day ${dayOfWeek}. Skipping notifications.`)
    return
  }

  // 4. 各漫画についてSlackに通知
  console.log(`Sending notifications for ${mangas.length} manga(s) on day ${dayOfWeek}`)

  for (const manga of mangas) {
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
