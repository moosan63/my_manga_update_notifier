import { useState, useEffect } from 'hono/jsx'

interface BiweeklyPreviewProps {
  initialDayOfWeek: number | null
  baseDate: string | null
}

const DAYS_OF_WEEK_NAMES = ['日', '月', '火', '水', '木', '金', '土']

/**
 * 基準日からターゲット日までの週数を計算
 */
function getWeeksSinceBase(baseDate: Date, targetDate: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000

  const baseStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

  const diffMs = targetStart.getTime() - baseStart.getTime()
  return Math.floor(diffMs / msPerWeek)
}

/**
 * 次回の隔週通知日を計算
 */
function getNextBiweeklyDate(dayOfWeek: number, baseDate: Date): Date {
  const from = new Date()

  const weeks = getWeeksSinceBase(baseDate, from)

  if (weeks < 0) {
    return new Date(baseDate)
  }

  const isEvenWeek = weeks % 2 === 0
  const fromDayOfWeek = from.getDay()

  const currentWeekSunday = new Date(from)
  currentWeekSunday.setDate(currentWeekSunday.getDate() - fromDayOfWeek)
  currentWeekSunday.setHours(0, 0, 0, 0)

  let targetWeekStart: Date

  if (isEvenWeek) {
    if (fromDayOfWeek < dayOfWeek) {
      targetWeekStart = currentWeekSunday
    } else if (fromDayOfWeek === dayOfWeek) {
      targetWeekStart = currentWeekSunday
    } else {
      targetWeekStart = new Date(currentWeekSunday)
      targetWeekStart.setDate(targetWeekStart.getDate() + 14)
    }
  } else {
    targetWeekStart = new Date(currentWeekSunday)
    targetWeekStart.setDate(targetWeekStart.getDate() + 7)
  }

  const result = new Date(targetWeekStart)
  result.setDate(result.getDate() + dayOfWeek)

  return result
}

/**
 * 日付をフォーマット（YYYY/MM/DD（曜）形式）
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dayOfWeek = DAYS_OF_WEEK_NAMES[date.getDay()]
  return `${year}/${month}/${day}（${dayOfWeek}）`
}

export default function BiweeklyPreview({ initialDayOfWeek, baseDate }: BiweeklyPreviewProps) {
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(initialDayOfWeek)
  const [nextDate, setNextDate] = useState<string | null>(null)
  const [isNewRegistration, setIsNewRegistration] = useState(!baseDate)

  useEffect(() => {
    // DOM上の曜日選択を監視
    const dayOfWeekRadios = document.querySelectorAll('.day-of-week-radio')

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.checked) {
        setSelectedDayOfWeek(parseInt(target.value, 10))
      }
    }

    dayOfWeekRadios.forEach((radio) => {
      radio.addEventListener('change', handleChange)
    })

    // 初期値の設定
    const checkedRadio = document.querySelector('.day-of-week-radio:checked') as HTMLInputElement | null
    if (checkedRadio) {
      setSelectedDayOfWeek(parseInt(checkedRadio.value, 10))
    }

    return () => {
      dayOfWeekRadios.forEach((radio) => {
        radio.removeEventListener('change', handleChange)
      })
    }
  }, [])

  useEffect(() => {
    if (selectedDayOfWeek !== null) {
      // 新規登録の場合は今日を基準日として使用
      const baseDateToUse = baseDate ? new Date(baseDate + 'T00:00:00') : new Date()
      const next = getNextBiweeklyDate(selectedDayOfWeek, baseDateToUse)
      setNextDate(formatDate(next))
    } else {
      setNextDate(null)
    }
  }, [selectedDayOfWeek, baseDate])

  if (selectedDayOfWeek === null) {
    return (
      <div class="bg-gaming-darker/50 rounded-xl p-4 border border-gaming-cyan/20">
        <p class="text-sm text-gaming-text-muted/70 text-center">
          曜日を選択すると、次回通知日が表示されます
        </p>
      </div>
    )
  }

  return (
    <div class="bg-gradient-to-r from-gaming-cyan/10 to-gaming-blue/10 rounded-xl p-4 border border-gaming-cyan/30">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gaming-cyan to-gaming-blue flex items-center justify-center shadow-lg shadow-gaming-cyan/30">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-sm text-gaming-text-muted">次の通知予定</p>
          <p class="text-lg font-bold text-gaming-text">
            {nextDate}
            {isNewRegistration && (
              <span class="text-sm font-normal text-gaming-cyan ml-2">から開始</span>
            )}
          </p>
        </div>
      </div>
      {isNewRegistration && (
        <p class="text-xs text-gaming-text-muted/60 mt-2 pl-14">
          登録日を基準に2週間ごとに通知されます
        </p>
      )}
    </div>
  )
}
