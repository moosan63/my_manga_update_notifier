-- マイグレーション: スケジュール関連カラムの追加
-- 目的: 週次以外のスケジュールタイプ（月次・隔週）をサポート
--
-- 変更内容:
--   1. schedule_type カラム追加 (TEXT DEFAULT 'weekly')
--   2. monthly_days カラム追加 (TEXT NULL, JSON配列文字列)
--   3. base_date カラム追加 (TEXT NULL, ISO 8601形式)
--   4. day_of_week をNULL許容に変更
--
-- 注意: SQLiteではALTER TABLEでNOT NULL制約を変更できないため、
--       テーブル再作成による移行を行う

-- 1. 新しいスキーマで一時テーブルを作成
CREATE TABLE IF NOT EXISTS mangas_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  schedule_type TEXT NOT NULL DEFAULT 'weekly' CHECK (schedule_type IN ('weekly', 'monthly', 'biweekly')),
  monthly_days TEXT,
  base_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 既存データを移行（既存データは全てweeklyとして扱う）
INSERT INTO mangas_new (id, title, url, day_of_week, schedule_type, monthly_days, base_date, created_at, updated_at)
SELECT
  id,
  title,
  url,
  day_of_week,
  'weekly',
  NULL,
  NULL,
  created_at,
  updated_at
FROM mangas;

-- 3. 元のテーブルを削除
DROP TABLE mangas;

-- 4. 一時テーブルを正式名にリネーム
ALTER TABLE mangas_new RENAME TO mangas;
