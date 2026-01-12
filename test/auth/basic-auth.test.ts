import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

// Basic認証ミドルウェアのテスト
describe('Basic認証', () => {
  const TEST_USER = 'testuser'
  const TEST_PASS = 'testpass'

  // テスト用アプリを作成
  const createTestApp = () => {
    const app = new Hono<{
      Bindings: {
        BASIC_AUTH_USER: string
        BASIC_AUTH_PASS: string
      }
    }>()

    // Basic認証ミドルウェアを適用
    app.use(
      '*',
      async (c, next) => {
        const auth = basicAuth({
          username: c.env.BASIC_AUTH_USER,
          password: c.env.BASIC_AUTH_PASS
        })
        return auth(c, next)
      }
    )

    // テスト用エンドポイント
    app.get('/', (c) => c.text('OK'))
    app.get('/api/test', (c) => c.json({ message: 'success' }))

    return app
  }

  // Basic認証ヘッダーを生成
  const createAuthHeader = (username: string, password: string) => {
    const credentials = btoa(`${username}:${password}`)
    return `Basic ${credentials}`
  }

  it('認証なしでアクセスすると401を返す', async () => {
    const app = createTestApp()
    const res = await app.request('/', {}, {
      BASIC_AUTH_USER: TEST_USER,
      BASIC_AUTH_PASS: TEST_PASS
    })
    expect(res.status).toBe(401)
  })

  it('正しい認証情報でアクセスすると200を返す', async () => {
    const app = createTestApp()
    const res = await app.request(
      '/',
      {
        headers: {
          Authorization: createAuthHeader(TEST_USER, TEST_PASS)
        }
      },
      {
        BASIC_AUTH_USER: TEST_USER,
        BASIC_AUTH_PASS: TEST_PASS
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('OK')
  })

  it('間違ったユーザー名では401を返す', async () => {
    const app = createTestApp()
    const res = await app.request(
      '/',
      {
        headers: {
          Authorization: createAuthHeader('wronguser', TEST_PASS)
        }
      },
      {
        BASIC_AUTH_USER: TEST_USER,
        BASIC_AUTH_PASS: TEST_PASS
      }
    )
    expect(res.status).toBe(401)
  })

  it('間違ったパスワードでは401を返す', async () => {
    const app = createTestApp()
    const res = await app.request(
      '/',
      {
        headers: {
          Authorization: createAuthHeader(TEST_USER, 'wrongpass')
        }
      },
      {
        BASIC_AUTH_USER: TEST_USER,
        BASIC_AUTH_PASS: TEST_PASS
      }
    )
    expect(res.status).toBe(401)
  })

  it('APIエンドポイントも認証が必要', async () => {
    const app = createTestApp()

    // 認証なし
    const resNoAuth = await app.request('/api/test', {}, {
      BASIC_AUTH_USER: TEST_USER,
      BASIC_AUTH_PASS: TEST_PASS
    })
    expect(resNoAuth.status).toBe(401)

    // 認証あり
    const resWithAuth = await app.request(
      '/api/test',
      {
        headers: {
          Authorization: createAuthHeader(TEST_USER, TEST_PASS)
        }
      },
      {
        BASIC_AUTH_USER: TEST_USER,
        BASIC_AUTH_PASS: TEST_PASS
      }
    )
    expect(resWithAuth.status).toBe(200)
    const data = await resWithAuth.json()
    expect(data).toEqual({ message: 'success' })
  })
})
