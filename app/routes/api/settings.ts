import { createRoute } from 'honox/factory'
import { getSettingsHandler, postSettingsHandler } from '../../lib/settings-handlers'

// GET /api/settings - 設定取得
export const GET = createRoute(getSettingsHandler)

// POST /api/settings - 設定保存
export const POST = createRoute(postSettingsHandler)
