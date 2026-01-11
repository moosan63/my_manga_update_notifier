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
    <div class="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-darker to-gaming-dark">
      <header class="header-gradient shadow-2xl backdrop-blur-sm sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div class="flex items-center gap-5">
            {showBackLink && (
              <a
                href={backLinkHref}
                class="text-gaming-text-muted hover:text-gaming-purple-light flex items-center gap-2 transition-all duration-300 group bg-gaming-card/50 px-4 py-2 rounded-2xl hover:bg-gaming-card border border-gaming-purple/20 hover:border-gaming-purple/40"
              >
                <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="font-medium">もどる</span>
              </a>
            )}
            <a href="/" class="flex items-center gap-3 group">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-gaming-purple to-gaming-pink flex items-center justify-center shadow-lg shadow-gaming-purple/30 group-hover:shadow-gaming-purple/50 transition-all duration-300 group-hover:scale-105">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="flex flex-col">
                <h1 class="text-xl font-bold text-gaming-text tracking-tight">
                  {title}
                </h1>
                <span class="text-xs text-gaming-text-muted">お気に入りの更新をお届け</span>
              </div>
            </a>
          </div>
          {!showBackLink && (
            <a
              href="/settings"
              class="text-gaming-text-muted hover:text-gaming-purple-light px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:bg-gaming-card flex items-center gap-2 hover:scale-105 border border-transparent hover:border-gaming-purple/30 group"
            >
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>通知設定</span>
            </a>
          )}
        </div>
      </header>
      <main class="max-w-5xl mx-auto px-6 py-8">{children}</main>
      <footer class="border-t border-gaming-purple/10 mt-auto">
        <div class="max-w-5xl mx-auto px-6 py-6 text-center">
          <p class="text-gaming-text-muted/60 text-sm">
            大好きな漫画の更新を見逃さない
          </p>
        </div>
      </footer>
    </div>
  )
}
