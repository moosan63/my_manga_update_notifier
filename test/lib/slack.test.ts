import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendSlackNotification } from '../../app/lib/slack'

describe('sendSlackNotification', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('Slack Webhookに正しい形式でPOSTする', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    })
    globalThis.fetch = mockFetch

    const webhookUrl = 'https://hooks.slack.com/services/xxx/yyy/zzz'
    const manga = { title: 'ワンピース', url: 'https://example.com/onepiece' }

    const result = await sendSlackNotification(webhookUrl, manga)

    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      webhookUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '📚 漫画更新のお知らせ',
          attachments: [
            {
              title: 'ワンピース',
              title_link: 'https://example.com/onepiece',
              color: '#36a64f'
            }
          ]
        })
      }
    )
  })

  it('Webhookリクエストが失敗した場合はfalseを返す', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    })
    globalThis.fetch = mockFetch

    const webhookUrl = 'https://hooks.slack.com/services/xxx/yyy/zzz'
    const manga = { title: 'ワンピース', url: 'https://example.com/onepiece' }

    const result = await sendSlackNotification(webhookUrl, manga)

    expect(result).toBe(false)
  })

  it('ネットワークエラーが発生した場合はfalseを返す', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    globalThis.fetch = mockFetch

    const webhookUrl = 'https://hooks.slack.com/services/xxx/yyy/zzz'
    const manga = { title: 'ワンピース', url: 'https://example.com/onepiece' }

    const result = await sendSlackNotification(webhookUrl, manga)

    expect(result).toBe(false)
  })

  it('日本語タイトルを正しく送信する', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    })
    globalThis.fetch = mockFetch

    const webhookUrl = 'https://hooks.slack.com/services/xxx/yyy/zzz'
    const manga = { title: '呪術廻戦', url: 'https://example.com/jjk' }

    const result = await sendSlackNotification(webhookUrl, manga)

    expect(result).toBe(true)
    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body.attachments[0].title).toBe('呪術廻戦')
  })
})
