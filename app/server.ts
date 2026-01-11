import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { handleScheduled } from './lib/cron-handler'

const app = createApp()

showRoutes(app)

// Cloudflare Workers のエクスポート形式
export default {
  fetch: app.fetch,
  scheduled: async (
    event: ScheduledEvent,
    env: { DB: D1Database },
    ctx: ExecutionContext
  ) => {
    ctx.waitUntil(handleScheduled(env.DB, new Date(event.scheduledTime)))
  }
}
