import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { handleScheduled } from './lib/cron-handler'

type Bindings = {
  DB: D1Database
  BASIC_AUTH_USER: string
  BASIC_AUTH_PASS: string
}

// HonoXアプリを作成
const app = createApp()

showRoutes(app)

// Basic認証のヘルパー関数
function verifyBasicAuth(
  request: Request,
  username: string,
  password: string
): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false
  }
  const base64Credentials = authHeader.slice(6)
  const credentials = atob(base64Credentials)
  const [user, pass] = credentials.split(':')
  return user === username && pass === password
}

// 401レスポンスを返す
function unauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"'
    }
  })
}

// Cloudflare Workers のエクスポート形式
export default {
  fetch: async (
    request: Request,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<Response> => {
    // Basic認証のチェック
    if (!verifyBasicAuth(request, env.BASIC_AUTH_USER, env.BASIC_AUTH_PASS)) {
      return unauthorizedResponse()
    }
    // 認証成功後、HonoXアプリに処理を委譲
    return app.fetch(request, env, ctx)
  },
  scheduled: async (
    event: ScheduledEvent,
    env: { DB: D1Database },
    ctx: ExecutionContext
  ) => {
    ctx.waitUntil(handleScheduled(env.DB, new Date(event.scheduledTime)))
  }
}
