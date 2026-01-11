import type { FC } from 'hono/jsx'
import type { Manga } from '../lib/manga-handlers'

interface MangaFormProps {
  manga?: Manga
  action: string
  submitLabel?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' }
]

export const MangaForm: FC<MangaFormProps> = ({ manga, action, submitLabel = '保存する' }) => {
  return (
    <form method="post" action={action} class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gaming-text-muted mb-1">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={manga?.title || ''}
          class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none"
          placeholder="ワンピース"
        />
      </div>

      <div>
        <label for="url" class="block text-sm font-medium text-gaming-text-muted mb-1">
          URL
        </label>
        <input
          type="url"
          id="url"
          name="url"
          required
          value={manga?.url || ''}
          class="input-gaming mt-1 block w-full rounded-lg border border-gaming-purple/30 bg-gaming-darker px-3 py-2 text-gaming-text placeholder-gaming-text-muted/50 focus:border-gaming-purple focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gaming-text-muted mb-2">更新曜日</label>
        <div class="flex gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day.value}
              class="flex items-center justify-center w-10 h-10 border border-gaming-purple/30 rounded-lg cursor-pointer bg-gaming-darker text-gaming-text-muted transition-all duration-200 hover:border-gaming-purple hover:bg-gaming-card has-[:checked]:bg-gradient-to-br has-[:checked]:from-gaming-purple has-[:checked]:to-gaming-pink has-[:checked]:text-white has-[:checked]:border-transparent has-[:checked]:shadow-lg"
            >
              <input
                type="radio"
                name="dayOfWeek"
                value={day.value}
                checked={manga?.dayOfWeek === day.value}
                required
                class="sr-only"
              />
              <span class="font-medium">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          class="btn-gradient w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:ring-offset-2 focus:ring-offset-gaming-dark"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
