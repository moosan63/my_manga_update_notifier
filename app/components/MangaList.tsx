import type { FC } from 'hono/jsx'
import type { Manga } from '../lib/manga-handlers'

interface MangaListProps {
  mangas: Manga[]
}

const DAYS_OF_WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function getDayOfWeekLabel(dayOfWeek: number): string {
  return `毎週${DAYS_OF_WEEK_LABELS[dayOfWeek]}曜日`
}

export const MangaList: FC<MangaListProps> = ({ mangas }) => {
  if (mangas.length === 0) {
    return (
      <div class="text-center py-12 text-gaming-text-muted">
        <p class="text-lg">登録されている漫画はありません</p>
        <p class="mt-2 text-sm text-gaming-text-muted/70">「+ 新規追加」ボタンから漫画を追加してください</p>
      </div>
    )
  }

  return (
    <div class="space-y-4">
      {mangas.map((manga) => (
        <div
          key={manga.id}
          class="card-gaming bg-gaming-card rounded-lg p-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gaming-text truncate">{manga.title}</h3>
              <a
                href={manga.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-gaming-cyan hover:text-gaming-cyan/80 truncate block transition-colors duration-200"
              >
                {manga.url}
              </a>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-sm text-gaming-purple-light whitespace-nowrap px-2 py-1 bg-gaming-purple/20 rounded-md">
                {getDayOfWeekLabel(manga.dayOfWeek)}
              </span>
              <a
                href={`/mangas/${manga.id}/edit`}
                class="px-3 py-1 text-sm text-gaming-text-muted bg-gaming-surface hover:bg-gaming-card-hover rounded-md transition-all duration-200 border border-gaming-purple/20 hover:border-gaming-purple/40"
              >
                編集
              </a>
              <form method="post" action={`/mangas/${manga.id}/delete`} class="inline">
                <button
                  type="submit"
                  class="px-3 py-1 text-sm text-gaming-pink bg-gaming-pink/10 hover:bg-gaming-pink/20 rounded-md transition-all duration-200 border border-gaming-pink/30 hover:border-gaming-pink/50"
                  onclick="return confirm('本当に削除しますか？')"
                >
                  削除
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
