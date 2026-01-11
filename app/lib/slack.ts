/**
 * Slack通知関数
 * Webhook URLに漫画更新情報をPOSTする
 */
export interface MangaNotification {
  title: string
  url: string
}

/**
 * Slack Webhookに漫画更新通知を送信する
 * @param webhookUrl Slack Webhook URL
 * @param manga 通知する漫画情報
 * @returns 送信成功時true、失敗時false
 */
export async function sendSlackNotification(
  webhookUrl: string,
  manga: MangaNotification
): Promise<boolean> {
  const payload = {
    text: '📚 漫画更新のお知らせ',
    attachments: [
      {
        title: manga.title,
        title_link: manga.url,
        color: '#36a64f'
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch {
    return false
  }
}
