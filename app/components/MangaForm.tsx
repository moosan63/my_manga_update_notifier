import type { FC } from 'hono/jsx'
import type { Manga, ScheduleType } from '../lib/manga-handlers'
import BiweeklyPreview from '../islands/BiweeklyPreview'

interface MangaFormProps {
  manga?: Manga
  action: string
  submitLabel?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: '日', color: 'from-red-500 to-orange-500' },
  { value: 1, label: '月', color: 'from-yellow-500 to-amber-500' },
  { value: 2, label: '火', color: 'from-red-600 to-rose-500' },
  { value: 3, label: '水', color: 'from-blue-500 to-cyan-500' },
  { value: 4, label: '木', color: 'from-green-500 to-emerald-500' },
  { value: 5, label: '金', color: 'from-yellow-400 to-amber-400' },
  { value: 6, label: '土', color: 'from-indigo-500 to-purple-500' }
]

const SCHEDULE_TYPES = [
  {
    value: 'weekly' as ScheduleType,
    label: '毎週',
    description: '毎週同じ曜日に通知',
    icon: '📅',
    color: 'from-gaming-purple to-gaming-pink'
  },
  {
    value: 'biweekly' as ScheduleType,
    label: '隔週',
    description: '2週間に1回通知',
    icon: '🔄',
    color: 'from-gaming-cyan to-gaming-blue'
  },
  {
    value: 'monthly' as ScheduleType,
    label: '月次',
    description: '毎月指定日に通知',
    icon: '📆',
    color: 'from-gaming-pink to-rose-500'
  }
]

// 月の日付配列（1-31）
const MONTHLY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export const MangaForm: FC<MangaFormProps> = ({ manga, action, submitLabel = 'これで完了!' }) => {
  // デフォルト値の設定
  const defaultScheduleType: ScheduleType = manga?.scheduleType || 'weekly'
  const defaultDayOfWeek = manga?.dayOfWeek ?? null
  const defaultMonthlyDays = manga?.monthlyDays || []

  return (
    <form method="post" action={action} class="space-y-8">
      {/* Step 1: Title */}
      <div class="space-y-3">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gaming-purple to-gaming-pink flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-gaming-purple/30">
            1
          </div>
          <label for="title" class="text-lg font-semibold text-gaming-text">
            どの漫画を追加しますか?
          </label>
        </div>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={manga?.title || ''}
          class="input-gaming block w-full rounded-2xl border-2 border-gaming-purple/20 bg-gaming-darker/80 px-5 py-4 text-lg text-gaming-text placeholder-gaming-text-muted/40 focus:border-gaming-purple focus:outline-none transition-all duration-300 focus:shadow-xl focus:shadow-gaming-purple/20 hover:border-gaming-purple/40"
          placeholder="例: ワンピース、呪術廻戦、SPY×FAMILY..."
        />
        <p class="text-sm text-gaming-text-muted/70 pl-1">
          お気に入りの漫画のタイトルを入力してね
        </p>
      </div>

      {/* Step 2: URL */}
      <div class="space-y-3">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gaming-cyan to-gaming-blue flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-gaming-cyan/30">
            2
          </div>
          <label for="url" class="text-lg font-semibold text-gaming-text">
            作品ページのURLを教えて
          </label>
        </div>
        <input
          type="url"
          id="url"
          name="url"
          required
          value={manga?.url || ''}
          class="input-gaming block w-full rounded-2xl border-2 border-gaming-purple/20 bg-gaming-darker/80 px-5 py-4 text-lg text-gaming-text placeholder-gaming-text-muted/40 focus:border-gaming-purple focus:outline-none transition-all duration-300 focus:shadow-xl focus:shadow-gaming-purple/20 hover:border-gaming-purple/40"
          placeholder="https://example.com/manga/..."
        />
        <p class="text-sm text-gaming-text-muted/70 pl-1">
          漫画の公式ページや配信サイトのURLを貼り付けてね
        </p>
      </div>

      {/* Step 3: Schedule Type */}
      <div class="space-y-3">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gaming-pink to-rose-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-gaming-pink/30">
            3
          </div>
          <label class="text-lg font-semibold text-gaming-text">
            通知パターンを選択
          </label>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SCHEDULE_TYPES.map((type) => (
            <label
              key={type.value}
              class="relative flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer bg-gaming-darker border-2 border-gaming-purple/20 text-gaming-text-muted transition-all duration-300 hover:border-gaming-purple/50 hover:bg-gaming-card hover:scale-[1.02] has-[:checked]:border-transparent has-[:checked]:shadow-xl group"
            >
              <input
                type="radio"
                name="scheduleType"
                value={type.value}
                checked={defaultScheduleType === type.value}
                required
                class="sr-only peer schedule-type-radio"
                data-schedule-type={type.value}
              />
              <div class={`absolute inset-0 rounded-2xl bg-gradient-to-br ${type.color} opacity-0 peer-checked:opacity-100 transition-opacity duration-300`}></div>
              <span class="relative z-10 text-2xl mb-2">{type.icon}</span>
              <span class="relative z-10 font-bold text-base peer-checked:text-white transition-colors duration-300">{type.label}</span>
              <span class="relative z-10 text-xs text-gaming-text-muted/60 peer-checked:text-white/80 mt-1 text-center">{type.description}</span>
            </label>
          ))}
        </div>
        <p class="text-sm text-gaming-text-muted/70 pl-1">
          通知を受け取りたい頻度を選んでね
        </p>
      </div>

      {/* Step 4: Day of Week / Monthly Days Selection */}
      <div class="space-y-3">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-500/30">
            4
          </div>
          <label class="text-lg font-semibold text-gaming-text">
            曜日または日付を選択
          </label>
        </div>

        {/* Day of Week Selection (for weekly/biweekly) */}
        <div id="dayOfWeekSection" class="schedule-section" data-for="weekly,biweekly">
          <p class="text-sm text-gaming-text-muted/70 mb-3 pl-1">
            更新される曜日を選んでね
          </p>
          <div class="grid grid-cols-7 gap-2 sm:gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                class="relative flex flex-col items-center justify-center aspect-square rounded-2xl cursor-pointer bg-gaming-darker border-2 border-gaming-purple/20 text-gaming-text-muted transition-all duration-300 hover:border-gaming-purple/50 hover:bg-gaming-card hover:scale-105 has-[:checked]:border-transparent has-[:checked]:shadow-xl group"
              >
                <input
                  type="radio"
                  name="dayOfWeek"
                  value={day.value}
                  checked={defaultDayOfWeek === day.value}
                  class="sr-only peer day-of-week-radio"
                />
                <div class={`absolute inset-0 rounded-2xl bg-gradient-to-br ${day.color} opacity-0 peer-checked:opacity-100 transition-opacity duration-300`}></div>
                <span class="relative z-10 font-bold text-lg sm:text-xl peer-checked:text-white transition-colors duration-300">{day.label}</span>
                <span class="relative z-10 text-xs text-gaming-text-muted/60 peer-checked:text-white/80 mt-1 hidden sm:block">曜日</span>
              </label>
            ))}
          </div>

          {/* Biweekly Preview (Island Component) */}
          <div id="biweeklyPreviewContainer" class="mt-4 hidden">
            <BiweeklyPreview
              initialDayOfWeek={defaultDayOfWeek}
              baseDate={manga?.baseDate || null}
            />
          </div>
        </div>

        {/* Monthly Days Selection (for monthly) */}
        <div id="monthlyDaysSection" class="schedule-section hidden" data-for="monthly">
          <p class="text-sm text-gaming-text-muted/70 mb-3 pl-1">
            通知を受け取る日付を選んでね（複数選択可）
          </p>
          <div class="grid grid-cols-7 gap-2">
            {MONTHLY_DAYS.map((day) => (
              <label
                key={day}
                class="relative flex items-center justify-center h-10 rounded-xl cursor-pointer bg-gaming-darker border-2 border-gaming-purple/20 text-gaming-text-muted transition-all duration-300 hover:border-gaming-purple/50 hover:bg-gaming-card hover:scale-105 has-[:checked]:border-transparent has-[:checked]:shadow-lg group"
              >
                <input
                  type="checkbox"
                  name="monthlyDays"
                  value={day}
                  checked={defaultMonthlyDays.includes(day)}
                  class="sr-only peer monthly-day-checkbox"
                />
                <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-gaming-pink to-rose-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></div>
                <span class="relative z-10 font-bold text-sm peer-checked:text-white transition-colors duration-300">{day}</span>
              </label>
            ))}
          </div>
          <p class="text-xs text-gaming-text-muted/50 mt-2 pl-1">
            31日など月によって存在しない日は自動でスキップされます
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div class="pt-6">
        <button
          type="submit"
          class="btn-gradient w-full text-white py-4 px-6 rounded-2xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-gaming-purple/50 focus:ring-offset-2 focus:ring-offset-gaming-dark flex items-center justify-center gap-3 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-gaming-purple/30 hover:shadow-2xl hover:shadow-gaming-purple/40"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{submitLabel}</span>
        </button>
      </div>

      {/* Client-side Script for Dynamic Section Visibility */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const scheduleRadios = document.querySelectorAll('.schedule-type-radio');
          const dayOfWeekSection = document.getElementById('dayOfWeekSection');
          const monthlyDaysSection = document.getElementById('monthlyDaysSection');
          const biweeklyPreviewContainer = document.getElementById('biweeklyPreviewContainer');
          const dayOfWeekRadios = document.querySelectorAll('.day-of-week-radio');
          const monthlyCheckboxes = document.querySelectorAll('.monthly-day-checkbox');

          function updateSectionVisibility(scheduleType) {
            if (scheduleType === 'monthly') {
              dayOfWeekSection.classList.add('hidden');
              monthlyDaysSection.classList.remove('hidden');
              // Make monthly checkboxes required-like behavior
              dayOfWeekRadios.forEach(r => r.removeAttribute('required'));
            } else {
              dayOfWeekSection.classList.remove('hidden');
              monthlyDaysSection.classList.remove('hidden');
              monthlyDaysSection.classList.add('hidden');
              // Make day of week required for weekly/biweekly
              dayOfWeekRadios.forEach(r => r.setAttribute('required', 'required'));
            }

            // Show/hide biweekly preview
            if (scheduleType === 'biweekly') {
              biweeklyPreviewContainer.classList.remove('hidden');
            } else {
              biweeklyPreviewContainer.classList.add('hidden');
            }
          }

          // Initial state
          const checkedRadio = document.querySelector('.schedule-type-radio:checked');
          if (checkedRadio) {
            updateSectionVisibility(checkedRadio.value);
          }

          // Listen for changes
          scheduleRadios.forEach(radio => {
            radio.addEventListener('change', function() {
              updateSectionVisibility(this.value);
            });
          });
        })();
      ` }} />
    </form>
  )
}
