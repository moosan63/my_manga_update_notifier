import {
  defineWorkersConfig,
  readD1Migrations
} from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig(async () => {
  const migrationsPath = './migrations'
  const migrations = await readD1Migrations(migrationsPath)

  return {
    test: {
      globals: true,
      poolOptions: {
        workers: {
          main: './app/test-app.ts',
          miniflare: {
            d1Databases: ['DB'],
            compatibilityDate: '2024-01-01',
            compatibilityFlags: ['nodejs_compat'],
            bindings: {
              TEST_MIGRATIONS: migrations
            }
          }
        }
      }
    }
  }
})
