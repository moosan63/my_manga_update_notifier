import type { Manga } from './manga-handlers'

/**
 * JSTの日付情報を取得する
 * Dateオブジェクトから日本時間の曜日と日付を取得
 */
function getJSTDateInfo(date: Date): { dayOfWeek: number; dayOfMonth: number; year: number; month: number } {
  // JSTオフセット（UTC+9）
  const jstOffset = 9 * 60 * 60 * 1000
  const jstDate = new Date(date.getTime() + jstOffset)

  return {
    dayOfWeek: jstDate.getUTCDay(),
    dayOfMonth: jstDate.getUTCDate(),
    year: jstDate.getUTCFullYear(),
    month: jstDate.getUTCMonth() + 1 // 1-12
  }
}

/**
 * 基準日からターゲット日までの週数を計算
 */
export function getWeeksSinceBase(baseDate: Date, targetDate: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000

  // 日付のみを比較するため、時刻を0にリセット
  const baseStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

  const diffMs = targetStart.getTime() - baseStart.getTime()
  return Math.floor(diffMs / msPerWeek)
}

/**
 * 指定した年月に指定した日が存在するか確認
 */
export function isValidDayInMonth(year: number, month: number, day: number): boolean {
  // 月は0ベースなので調整
  const date = new Date(year, month - 1, day)
  // 月が変わっていなければ有効な日付
  return date.getMonth() === month - 1 && date.getDate() === day
}

/**
 * 週次スケジュールの通知判定
 */
export function shouldNotifyWeekly(manga: Manga, today: Date): boolean {
  if (manga.dayOfWeek === null) {
    return false
  }

  const { dayOfWeek } = getJSTDateInfo(today)
  return dayOfWeek === manga.dayOfWeek
}

/**
 * 隔週スケジュールの通知判定
 */
export function shouldNotifyBiweekly(manga: Manga, today: Date): boolean {
  if (manga.dayOfWeek === null || manga.baseDate === null) {
    return false
  }

  const { dayOfWeek } = getJSTDateInfo(today)

  // 曜日が一致しない場合は即座にfalse
  if (dayOfWeek !== manga.dayOfWeek) {
    return false
  }

  // 基準日からの週数を計算
  const baseDate = new Date(manga.baseDate + 'T00:00:00+09:00')
  const weeks = getWeeksSinceBase(baseDate, today)

  // 偶数週（0, 2, 4...）の場合に通知
  return weeks >= 0 && weeks % 2 === 0
}

/**
 * 月次スケジュールの通知判定
 */
export function shouldNotifyMonthly(manga: Manga, today: Date): boolean {
  if (manga.monthlyDays === null || manga.monthlyDays.length === 0) {
    return false
  }

  const { dayOfMonth, year, month } = getJSTDateInfo(today)

  // 指定された日付のいずれかに一致するか確認
  // その月に存在する日付のみを対象とする
  return manga.monthlyDays.some(
    (targetDay) => isValidDayInMonth(year, month, targetDay) && dayOfMonth === targetDay
  )
}

/**
 * 統合通知判定関数
 */
export function shouldNotify(manga: Manga, today: Date): boolean {
  switch (manga.scheduleType) {
    case 'weekly':
      return shouldNotifyWeekly(manga, today)
    case 'biweekly':
      return shouldNotifyBiweekly(manga, today)
    case 'monthly':
      return shouldNotifyMonthly(manga, today)
    default:
      return false
  }
}

/**
 * 次回の隔週通知日を計算（UIプレビュー用）
 */
export function getNextBiweeklyDate(dayOfWeek: number, baseDate: Date, fromDate?: Date): Date {
  const from = fromDate || new Date()

  // 基準日からの週数を計算
  const weeks = getWeeksSinceBase(baseDate, from)

  // fromDateがbaseDateより前の場合は基準日を返す
  if (weeks < 0) {
    return new Date(baseDate)
  }

  // 偶数週かどうかを確認
  const isEvenWeek = weeks % 2 === 0

  // fromDateの曜日
  const fromDayOfWeek = from.getDay()

  // 基準日の週初め（日曜日）を計算
  const baseSunday = new Date(baseDate)
  baseSunday.setDate(baseSunday.getDate() - baseSunday.getDay())

  // 現在の週の開始日を計算
  const currentWeekSunday = new Date(from)
  currentWeekSunday.setDate(currentWeekSunday.getDate() - fromDayOfWeek)
  currentWeekSunday.setHours(0, 0, 0, 0)

  // 次の通知日を計算
  let targetWeekStart: Date

  if (isEvenWeek) {
    // 偶数週の場合
    if (fromDayOfWeek < dayOfWeek) {
      // まだその週の対象曜日が来ていない
      targetWeekStart = currentWeekSunday
    } else if (fromDayOfWeek === dayOfWeek) {
      // 今日が対象曜日
      targetWeekStart = currentWeekSunday
    } else {
      // 対象曜日を過ぎた -> 次の偶数週（2週間後）
      targetWeekStart = new Date(currentWeekSunday)
      targetWeekStart.setDate(targetWeekStart.getDate() + 14)
    }
  } else {
    // 奇数週の場合 -> 次の偶数週（来週）
    targetWeekStart = new Date(currentWeekSunday)
    targetWeekStart.setDate(targetWeekStart.getDate() + 7)
  }

  // 対象週の対象曜日を計算
  const result = new Date(targetWeekStart)
  result.setDate(result.getDate() + dayOfWeek)

  return result
}
