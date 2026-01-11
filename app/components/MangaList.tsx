import type { FC } from 'hono/jsx'
import type { Manga } from '../lib/manga-handlers'

interface MangaListProps {
  mangas: Manga[]
}

const DAYS_OF_WEEK_DATA = [
  { label: '日', emoji: '🌞' },
  { label: '月', emoji: '🌙' },
  { label: '火', emoji: '🔥' },
  { label: '水', emoji: '💧' },
  { label: '木', emoji: '🌳' },
  { label: '金', emoji: '💰' },
  { label: '土', emoji: '🪨' }
]

function getDayOfWeekLabel(dayOfWeek: number): { text: string; emoji: string } {
  const day = DAYS_OF_WEEK_DATA[dayOfWeek]
  return { text: `毎週${day.label}曜日`, emoji: day.emoji }
}

export const MangaList: FC<MangaListProps> = ({ mangas }) => {
  if (mangas.length === 0) {
    return (
      <div class="text-center py-16 text-gaming-text-muted">
        <div class="text-6xl mb-4 animate-bounce">📚</div>
        <p class="text-xl font-medium mb-2">まだ漫画が登録されていません</p>
        <p class="text-sm text-gaming-text-muted/70">
          ✨「新規追加」ボタンから、お気に入りの漫画を追加しましょう！✨
        </p>
        <div class="mt-4 text-2xl">
          <span class="inline-block animate-pulse">📖</span>
          <span class="inline-block mx-1">→</span>
          <span class="inline-block">🔔</span>
          <span class="inline-block mx-1">→</span>
          <span class="inline-block animate-pulse">🎉</span>
        </div>
      </div>
    )
  }

  return (
    <div class="space-y-4">
      {mangas.map((manga) => {
        const dayInfo = getDayOfWeekLabel(manga.dayOfWeek)
        return (
          <div
            key={manga.id}
            class="card-gaming bg-gaming-card rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gaming-purple/10"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gaming-text truncate flex items-center gap-2">
                  <span>📖</span>
                  <span>{manga.title}</span>
                </h3>
                <a
                  href={manga.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gaming-cyan hover:text-gaming-cyan/80 truncate flex items-center gap-1.5 transition-colors duration-200 mt-1"
                >
                  <span>🔗</span>
                  <span class="truncate">{manga.url}</span>
                </a>
              </div>
              <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <span class="text-sm text-gaming-purple-light whitespace-nowrap px-2 py-1 bg-gaming-purple/20 rounded-md flex items-center gap-1.5">
                  <span>{dayInfo.emoji}</span>
                  <span>{dayInfo.text}</span>
                </span>
                <a
                  href={`/mangas/${manga.id}/edit`}
                  class="px-3 py-1 text-sm text-gaming-text-muted bg-gaming-surface hover:bg-gaming-card-hover rounded-md transition-all duration-200 border border-gaming-purple/20 hover:border-gaming-purple/40 flex items-center gap-1.5 hover:scale-105"
                >
                  <span>✏️</span>
                  <span>編集</span>
                </a>
                <form method="post" action={`/mangas/${manga.id}/delete`} class="inline">
                  <button
                    type="submit"
                    class="px-3 py-1 text-sm text-gaming-pink bg-gaming-pink/10 hover:bg-gaming-pink/20 rounded-md transition-all duration-200 border border-gaming-pink/30 hover:border-gaming-pink/50 flex items-center gap-1.5 hover:scale-105"
                    onclick="return confirm('本当に削除しますか？')"
                  >
                    <span>🗑️</span>
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
