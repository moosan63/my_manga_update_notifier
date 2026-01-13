import { describe, it, expect } from 'vitest'
import {
  shouldNotifyWeekly,
  shouldNotifyBiweekly,
  shouldNotifyMonthly,
  shouldNotify,
  getNextBiweeklyDate,
  getWeeksSinceBase,
  isValidDayInMonth
} from '../../app/lib/schedule-utils'
import type { Manga } from '../../app/lib/manga-handlers'

// テスト用のMangaオブジェクトを生成するヘルパー
function createManga(overrides: Partial<Manga> = {}): Manga {
  return {
    id: 1,
    title: 'テスト漫画',
    url: 'https://example.com/manga',
    scheduleType: 'weekly',
    dayOfWeek: 0,
    monthlyDays: null,
    baseDate: null,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
    ...overrides
  }
}

describe('shouldNotifyWeekly', () => {
  it('曜日が一致する場合はtrueを返す', () => {
    // 2024-01-07は日曜日（dayOfWeek: 0）
    const manga = createManga({ scheduleType: 'weekly', dayOfWeek: 0 })
    const sunday = new Date('2024-01-07T12:00:00+09:00')

    expect(shouldNotifyWeekly(manga, sunday)).toBe(true)
  })

  it('曜日が一致しない場合はfalseを返す', () => {
    // 2024-01-08は月曜日（dayOfWeek: 1）
    const manga = createManga({ scheduleType: 'weekly', dayOfWeek: 0 })
    const monday = new Date('2024-01-08T12:00:00+09:00')

    expect(shouldNotifyWeekly(manga, monday)).toBe(false)
  })

  it('dayOfWeekがnullの場合はfalseを返す', () => {
    const manga = createManga({ scheduleType: 'weekly', dayOfWeek: null })
    const sunday = new Date('2024-01-07T12:00:00+09:00')

    expect(shouldNotifyWeekly(manga, sunday)).toBe(false)
  })

  it('土曜日（dayOfWeek: 6）のテスト', () => {
    // 2024-01-06は土曜日
    const manga = createManga({ scheduleType: 'weekly', dayOfWeek: 6 })
    const saturday = new Date('2024-01-06T12:00:00+09:00')

    expect(shouldNotifyWeekly(manga, saturday)).toBe(true)
  })
})

describe('shouldNotifyBiweekly', () => {
  // 基準日: 2024-01-07（日曜日）
  // 次の通知: 2024-01-21（2週間後）
  // その次: 2024-02-04（4週間後）

  it('基準日から偶数週で曜日が一致する場合はtrueを返す', () => {
    const baseDate = '2024-01-07'
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: 0, // 日曜日
      baseDate
    })

    // 基準日当日（0週目 = 偶数週）
    const week0 = new Date('2024-01-07T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, week0)).toBe(true)

    // 2週間後
    const week2 = new Date('2024-01-21T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, week2)).toBe(true)

    // 4週間後
    const week4 = new Date('2024-02-04T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, week4)).toBe(true)
  })

  it('基準日から奇数週の場合はfalseを返す', () => {
    const baseDate = '2024-01-07'
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: 0, // 日曜日
      baseDate
    })

    // 1週間後（奇数週）
    const week1 = new Date('2024-01-14T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, week1)).toBe(false)

    // 3週間後（奇数週）
    const week3 = new Date('2024-01-28T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, week3)).toBe(false)
  })

  it('曜日が一致しない場合はfalseを返す', () => {
    const baseDate = '2024-01-07'
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: 0, // 日曜日
      baseDate
    })

    // 偶数週だが月曜日
    const monday = new Date('2024-01-08T12:00:00+09:00')
    expect(shouldNotifyBiweekly(manga, monday)).toBe(false)
  })

  it('baseDateがnullの場合はfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: 0,
      baseDate: null
    })
    const sunday = new Date('2024-01-07T12:00:00+09:00')

    expect(shouldNotifyBiweekly(manga, sunday)).toBe(false)
  })

  it('dayOfWeekがnullの場合はfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: null,
      baseDate: '2024-01-07'
    })
    const sunday = new Date('2024-01-07T12:00:00+09:00')

    expect(shouldNotifyBiweekly(manga, sunday)).toBe(false)
  })
})

describe('shouldNotifyMonthly', () => {
  it('日付が一致する場合はtrueを返す', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [15]
    })
    const day15 = new Date('2024-01-15T12:00:00+09:00')

    expect(shouldNotifyMonthly(manga, day15)).toBe(true)
  })

  it('複数の日付のいずれかに一致する場合はtrueを返す', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [1, 15]
    })

    const day1 = new Date('2024-01-01T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, day1)).toBe(true)

    const day15 = new Date('2024-02-15T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, day15)).toBe(true)
  })

  it('日付が一致しない場合はfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [15]
    })
    const day14 = new Date('2024-01-14T12:00:00+09:00')

    expect(shouldNotifyMonthly(manga, day14)).toBe(false)
  })

  it('存在しない日付（31日指定で30日の月）はスキップされる', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [31]
    })

    // 4月は30日まで
    const april30 = new Date('2024-04-30T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, april30)).toBe(false)

    // 1月は31日まで
    const jan31 = new Date('2024-01-31T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, jan31)).toBe(true)
  })

  it('2月の特殊ケース（29日、30日、31日）', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [29, 30, 31]
    })

    // 閏年の2月29日
    const feb29 = new Date('2024-02-29T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, feb29)).toBe(true)

    // 閏年でない年の2月28日では通知しない
    const feb28_2025 = new Date('2025-02-28T12:00:00+09:00')
    expect(shouldNotifyMonthly(manga, feb28_2025)).toBe(false)
  })

  it('monthlyDaysがnullの場合はfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: null
    })
    const day15 = new Date('2024-01-15T12:00:00+09:00')

    expect(shouldNotifyMonthly(manga, day15)).toBe(false)
  })

  it('monthlyDaysが空配列の場合はfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: []
    })
    const day15 = new Date('2024-01-15T12:00:00+09:00')

    expect(shouldNotifyMonthly(manga, day15)).toBe(false)
  })
})

describe('shouldNotify（統合関数）', () => {
  it('weekly: 曜日一致で通知', () => {
    const manga = createManga({ scheduleType: 'weekly', dayOfWeek: 0 })
    const sunday = new Date('2024-01-07T12:00:00+09:00')

    expect(shouldNotify(manga, sunday)).toBe(true)
  })

  it('biweekly: 偶数週で曜日一致なら通知', () => {
    const manga = createManga({
      scheduleType: 'biweekly',
      dayOfWeek: 0,
      baseDate: '2024-01-07'
    })
    const week2 = new Date('2024-01-21T12:00:00+09:00')

    expect(shouldNotify(manga, week2)).toBe(true)
  })

  it('monthly: 日付一致で通知', () => {
    const manga = createManga({
      scheduleType: 'monthly',
      monthlyDays: [15]
    })
    const day15 = new Date('2024-01-15T12:00:00+09:00')

    expect(shouldNotify(manga, day15)).toBe(true)
  })

  it('不明なスケジュールタイプはfalseを返す', () => {
    const manga = createManga({
      scheduleType: 'unknown' as any // 不正な型
    })
    const today = new Date('2024-01-15T12:00:00+09:00')

    expect(shouldNotify(manga, today)).toBe(false)
  })
})

describe('getWeeksSinceBase', () => {
  it('同じ日は0週間', () => {
    const base = new Date('2024-01-07T00:00:00+09:00')
    const target = new Date('2024-01-07T23:59:59+09:00')

    expect(getWeeksSinceBase(base, target)).toBe(0)
  })

  it('1週間後は1週間', () => {
    const base = new Date('2024-01-07T00:00:00+09:00')
    const target = new Date('2024-01-14T12:00:00+09:00')

    expect(getWeeksSinceBase(base, target)).toBe(1)
  })

  it('2週間後は2週間', () => {
    const base = new Date('2024-01-07T00:00:00+09:00')
    const target = new Date('2024-01-21T12:00:00+09:00')

    expect(getWeeksSinceBase(base, target)).toBe(2)
  })

  it('基準日より前の日付は負の週数を返す', () => {
    const base = new Date('2024-01-14T00:00:00+09:00')
    const target = new Date('2024-01-07T12:00:00+09:00')

    expect(getWeeksSinceBase(base, target)).toBe(-1)
  })
})

describe('isValidDayInMonth', () => {
  it('通常の日付は有効', () => {
    expect(isValidDayInMonth(2024, 1, 15)).toBe(true)
    expect(isValidDayInMonth(2024, 1, 31)).toBe(true)
  })

  it('30日の月で31日は無効', () => {
    // 4月は30日まで
    expect(isValidDayInMonth(2024, 4, 30)).toBe(true)
    expect(isValidDayInMonth(2024, 4, 31)).toBe(false)
  })

  it('閏年の2月29日は有効', () => {
    expect(isValidDayInMonth(2024, 2, 29)).toBe(true)
    expect(isValidDayInMonth(2024, 2, 30)).toBe(false)
  })

  it('閏年でない年の2月29日は無効', () => {
    expect(isValidDayInMonth(2025, 2, 28)).toBe(true)
    expect(isValidDayInMonth(2025, 2, 29)).toBe(false)
  })
})

describe('getNextBiweeklyDate', () => {
  it('次回の隔週日付を正しく計算する', () => {
    const baseDate = new Date('2024-01-07T00:00:00+09:00') // 日曜日
    const fromDate = new Date('2024-01-08T12:00:00+09:00') // 月曜日（基準日の翌日）

    const next = getNextBiweeklyDate(0, baseDate, fromDate)

    // 次は2024-01-21（2週間後の日曜日）
    expect(next.getFullYear()).toBe(2024)
    expect(next.getMonth()).toBe(0) // 1月
    expect(next.getDate()).toBe(21)
  })

  it('基準日当日は基準日自体を返す', () => {
    const baseDate = new Date('2024-01-07T00:00:00+09:00')
    const fromDate = new Date('2024-01-07T12:00:00+09:00')

    const next = getNextBiweeklyDate(0, baseDate, fromDate)

    expect(next.getDate()).toBe(7)
  })

  it('奇数週の同じ曜日からは次の偶数週の日付を返す', () => {
    const baseDate = new Date('2024-01-07T00:00:00+09:00')
    const fromDate = new Date('2024-01-14T12:00:00+09:00') // 1週間後（奇数週）

    const next = getNextBiweeklyDate(0, baseDate, fromDate)

    // 次の偶数週は2024-01-21
    expect(next.getDate()).toBe(21)
  })

  it('偶数週の曜日より後のfromDateからは2週間後を返す', () => {
    const baseDate = new Date('2024-01-07T00:00:00+09:00')
    // 2024-01-21（偶数週の日曜日）の翌日から検索
    const fromDate = new Date('2024-01-22T12:00:00+09:00')

    const next = getNextBiweeklyDate(0, baseDate, fromDate)

    // 次は2024-02-04
    expect(next.getFullYear()).toBe(2024)
    expect(next.getMonth()).toBe(1) // 2月
    expect(next.getDate()).toBe(4)
  })

  it('fromDateを省略した場合は現在日時を使用する', () => {
    const baseDate = new Date('2024-01-07T00:00:00+09:00')

    // fromDateを省略
    const next = getNextBiweeklyDate(0, baseDate)

    // 現在日時以降の日付が返される
    expect(next instanceof Date).toBe(true)
    expect(next.getDay()).toBe(0) // 日曜日
  })
})
