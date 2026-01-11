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
        <label for="title" class="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={manga?.title || ''}
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="ワンピース"
        />
      </div>

      <div>
        <label for="url" class="block text-sm font-medium text-gray-700">
          URL
        </label>
        <input
          type="url"
          id="url"
          name="url"
          required
          value={manga?.url || ''}
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">更新曜日</label>
        <div class="flex gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day.value}
              class="flex items-center justify-center w-10 h-10 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-500"
            >
              <input
                type="radio"
                name="dayOfWeek"
                value={day.value}
                checked={manga?.dayOfWeek === day.value}
                required
                class="sr-only"
              />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
