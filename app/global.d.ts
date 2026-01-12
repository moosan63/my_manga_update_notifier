import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      DB: D1Database
      BASIC_AUTH_USER: string
      BASIC_AUTH_PASS: string
    }
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv {
    DB: D1Database
    TEST_MIGRATIONS: D1Migration[]
  }
}

interface D1Migration {
  name: string
  queries: string[]
}
