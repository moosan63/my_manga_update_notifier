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
                class="text-gaming-text-muted hover:text-gaming-purple-light flex items-center gap-1 transition-colors duration-200"
              >
                <span>&larr;</span>
                <span>戻る</span>
              </a>
            )}
            <h1 class="text-xl font-bold text-gaming-text text-neon">{title}</h1>
          </div>
          {!showBackLink && (
            <a
              href="/settings"
              class="text-gaming-text-muted hover:text-gaming-purple-light px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gaming-card"
            >
              設定
            </a>
          )}
        </div>
      </header>
      <main class="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
