import type { FC } from 'hono/jsx'
import type { Manga } from '../lib/manga-handlers'

interface MangaListProps {
  mangas: Manga[]
}

const DAYS_OF_WEEK_DATA = [
  { label: '日', fullLabel: '日曜日', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
  { label: '月', fullLabel: '月曜日', color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400' },
  { label: '火', fullLabel: '火曜日', color: 'from-red-600 to-rose-500', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400' },
  { label: '水', fullLabel: '水曜日', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  { label: '木', fullLabel: '木曜日', color: 'from-green-500 to-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { label: '金', fullLabel: '金曜日', color: 'from-yellow-400 to-amber-400', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { label: '土', fullLabel: '土曜日', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' }
]

// Generate a consistent color based on manga title
function getThumbnailColor(title: string): string {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500'
  ]
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export const MangaList: FC<MangaListProps> = ({ mangas }) => {
  if (mangas.length === 0) {
    return (
      <div class="text-center py-20">
        {/* Decorative illustration */}
        <div class="relative w-40 h-40 mx-auto mb-8">
          <div class="absolute inset-0 bg-gradient-to-br from-gaming-purple/20 to-gaming-pink/20 rounded-full blur-2xl"></div>
          <div class="relative w-full h-full bg-gaming-card rounded-3xl border-2 border-dashed border-gaming-purple/30 flex items-center justify-center">
            <svg class="w-20 h-20 text-gaming-purple/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <h3 class="text-2xl font-bold text-gaming-text mb-3">
          お気に入りの漫画を追加しよう!
        </h3>
        <p class="text-gaming-text-muted mb-8 max-w-md mx-auto">
          毎週の更新日にSlackでお知らせが届くから、<br class="hidden sm:block" />
          もう読み忘れる心配はありません
        </p>

        {/* Flow illustration */}
        <div class="flex items-center justify-center gap-4 mb-10 text-gaming-text-muted/60">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-gaming-card border border-gaming-purple/20 flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-gaming-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-xs">漫画を登録</span>
          </div>
          <svg class="w-6 h-6 text-gaming-purple/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-gaming-card border border-gaming-purple/20 flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-gaming-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-xs">更新日が来る</span>
          </div>
          <svg class="w-6 h-6 text-gaming-purple/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-2xl bg-gaming-card border border-gaming-purple/20 flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-gaming-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span class="text-xs">Slackに通知</span>
          </div>
        </div>

        <a
          href="/mangas/new"
          class="btn-gradient inline-flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl shadow-gaming-purple/30 hover:shadow-2xl hover:shadow-gaming-purple/40"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>最初の漫画を追加する</span>
        </a>
      </div>
    )
  }

  return (
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {mangas.map((manga) => {
        const dayInfo = manga.dayOfWeek !== null ? DAYS_OF_WEEK_DATA[manga.dayOfWeek] : null
        const thumbnailColor = getThumbnailColor(manga.title)
        return (
          <div
            key={manga.id}
            class="group bg-gaming-card/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gaming-purple/20 border border-gaming-purple/10 hover:border-gaming-purple/30"
          >
            {/* Thumbnail area */}
            <div class={`h-32 bg-gradient-to-br ${thumbnailColor} relative overflow-hidden`}>
              <div class="absolute inset-0 bg-black/20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-5xl font-black text-white/30 tracking-tighter select-none">
                  {manga.title.charAt(0)}
                </span>
              </div>
              {/* Schedule badge */}
              <div class="absolute top-4 right-4">
                {dayInfo ? (
                  <div class={`px-3 py-1.5 rounded-full ${dayInfo.bgColor} backdrop-blur-sm border border-white/10`}>
                    <span class={`text-sm font-bold ${dayInfo.textColor}`}>
                      {manga.scheduleType === 'biweekly' ? `隔週 ${dayInfo.label}曜` : dayInfo.fullLabel}
                    </span>
                  </div>
                ) : manga.monthlyDays ? (
                  <div class="px-3 py-1.5 rounded-full bg-gaming-purple/20 backdrop-blur-sm border border-white/10">
                    <span class="text-sm font-bold text-gaming-purple-light">
                      毎月 {manga.monthlyDays.slice(0, 3).join(', ')}{manga.monthlyDays.length > 3 ? '...' : ''}日
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Content */}
            <div class="p-5">
              <h3 class="font-bold text-lg text-gaming-text mb-2 truncate group-hover:text-gaming-purple-light transition-colors duration-300">
                {manga.title}
              </h3>
              <a
                href={manga.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gaming-cyan/80 hover:text-gaming-cyan truncate flex items-center gap-2 transition-colors duration-200 mb-4"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="truncate">{new URL(manga.url).hostname}</span>
              </a>

              {/* Actions */}
              <div class="flex gap-2">
                <a
                  href={`/mangas/${manga.id}/edit`}
                  class="flex-1 px-4 py-2.5 text-sm font-medium text-gaming-text-muted bg-gaming-surface hover:bg-gaming-card-hover rounded-xl transition-all duration-200 border border-gaming-purple/20 hover:border-gaming-purple/40 flex items-center justify-center gap-2 hover:text-gaming-purple-light"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>編集</span>
                </a>
                <form method="post" action={`/mangas/${manga.id}/delete`} class="flex-1">
                  <button
                    type="submit"
                    class="w-full px-4 py-2.5 text-sm font-medium text-gaming-pink bg-gaming-pink/10 hover:bg-gaming-pink/20 rounded-xl transition-all duration-200 border border-gaming-pink/20 hover:border-gaming-pink/40 flex items-center justify-center gap-2"
                    onclick="return confirm('この漫画を削除しますか?')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>削除</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
