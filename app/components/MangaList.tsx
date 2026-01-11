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
      <div class="text-center py-12 text-gray-500">
        <p>登録されている漫画はありません</p>
        <p class="mt-2 text-sm">「+ 新規追加」ボタンから漫画を追加してください</p>
      </div>
    )
  }

  return (
    <div class="space-y-4">
      {mangas.map((manga) => (
        <div
          key={manga.id}
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">{manga.title}</h3>
              <a
                href={manga.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-blue-600 hover:text-blue-800 truncate block"
              >
                {manga.url}
              </a>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-sm text-gray-500 whitespace-nowrap">
                {getDayOfWeekLabel(manga.dayOfWeek)}
              </span>
              <a
                href={`/mangas/${manga.id}/edit`}
                class="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
              >
                編集
              </a>
              <form method="post" action={`/mangas/${manga.id}/delete`} class="inline">
                <button
                  type="submit"
                  class="px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded"
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
