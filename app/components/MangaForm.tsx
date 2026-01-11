import type { FC } from 'hono/jsx'
import type { Manga } from '../lib/manga-handlers'

interface MangaFormProps {
  manga?: Manga
  action: string
  submitLabel?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: '日', emoji: '🌞' },
  { value: 1, label: '月', emoji: '🌙' },
  { value: 2, label: '火', emoji: '🔥' },
  { value: 3, label: '水', emoji: '💧' },
  { value: 4, label: '木', emoji: '🌳' },
  { value: 5, label: '金', emoji: '💰' },
  { value: 6, label: '土', emoji: '🪨' }
]

export const MangaForm: FC<MangaFormProps> = ({ manga, action, submitLabel = '保存する' }) => {
  return (
    <form method="post" action={action} class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gaming-text-muted mb-1 flex items-center gap-1.5">
          <span>📖</span>
          <span>タイトル</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={manga?.title || ''}
          class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none transition-all duration-200 focus:shadow-lg focus:shadow-gaming-purple/20"
          placeholder="ワンピース"
        />
      </div>

      <div>
        <label for="url" class="block text-sm font-medium text-gaming-text-muted mb-1 flex items-center gap-1.5">
          <span>🔗</span>
          <span>URL</span>
        </label>
        <input
          type="url"
          id="url"
          name="url"
          required
          value={manga?.url || ''}
          class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none transition-all duration-200 focus:shadow-lg focus:shadow-gaming-purple/20"
          placeholder="https://..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gaming-text-muted mb-2 flex items-center gap-1.5">
          <span>📅</span>
          <span>更新曜日</span>
        </label>
        <div class="flex gap-2 flex-wrap">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day.value}
              class="flex flex-col items-center justify-center w-14 h-14 border border-gaming-purple/30 rounded-lg cursor-pointer bg-gaming-darker text-gaming-text-muted transition-all duration-200 hover:border-gaming-purple hover:bg-gaming-card hover:scale-105 has-[:checked]:bg-gradient-to-br has-[:checked]:from-gaming-purple has-[:checked]:to-gaming-pink has-[:checked]:text-white has-[:checked]:border-transparent has-[:checked]:shadow-lg has-[:checked]:shadow-gaming-purple/30 has-[:checked]:scale-110"
            >
              <input
                type="radio"
                name="dayOfWeek"
                value={day.value}
                checked={manga?.dayOfWeek === day.value}
                required
                class="sr-only"
              />
              <span class="text-lg">{day.emoji}</span>
              <span class="font-medium text-xs">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          class="btn-gradient w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:ring-offset-2 focus:ring-offset-gaming-dark flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-200"
        >
          <span>💾</span>
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  )
}
