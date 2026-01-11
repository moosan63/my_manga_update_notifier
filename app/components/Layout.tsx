import type { FC, PropsWithChildren } from 'hono/jsx'

interface LayoutProps {
  title?: string
  showBackLink?: boolean
  backLinkHref?: string
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  children,
  title = '漫画更新通知',
  showBackLink = false,
  backLinkHref = '/'
}) => {
  return (
    <div class="min-h-screen bg-gaming-dark">
      <header class="header-gradient shadow-lg">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            {showBackLink && (
              <a
                href={backLinkHref}
                class="text-gaming-text-muted hover:text-gaming-purple-light flex items-center gap-1.5 transition-colors duration-200 group"
              >
                <span class="text-lg group-hover:animate-pulse">🔙</span>
                <span>戻る</span>
              </a>
            )}
            <h1 class="text-xl font-bold text-gaming-text text-neon flex items-center gap-2">
              <span class="text-2xl">📚</span>
              {title}
            </h1>
          </div>
          {!showBackLink && (
            <a
              href="/settings"
              class="text-gaming-text-muted hover:text-gaming-purple-light px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gaming-card flex items-center gap-1.5 hover:scale-105"
            >
              <span>⚙️</span>
              <span>設定</span>
            </a>
          )}
        </div>
      </header>
      <main class="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
