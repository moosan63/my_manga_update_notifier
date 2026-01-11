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
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            {showBackLink && (
              <a
                href={backLinkHref}
                class="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <span>&larr;</span>
                <span>戻る</span>
              </a>
            )}
            <h1 class="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          {!showBackLink && (
            <a
              href="/settings"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
