# TODO

## 過去の実装（完了済み）

<details>
<summary>初期実装（折りたたみ）</summary>

### セットアップ

- [x] HonoXプロジェクト作成（create-hono）
- [x] wrangler.tomlの設定（D1バインディング、Cron設定）
- [ ] D1データベースの作成（wrangler d1 create）※リモート環境用

### データベース

- [x] mangasテーブルのマイグレーションSQL作成
- [x] settingsテーブルのマイグレーションSQL作成
- [x] マイグレーションの実行（ローカル）

### 漫画API

- [x] 漫画一覧取得API（GET /api/mangas）
- [x] 漫画追加API（POST /api/mangas）
- [x] 漫画更新API（PUT /api/mangas/:id）
- [x] 漫画削除API（DELETE /api/mangas/:id）

### 漫画UI

- [x] 漫画一覧ページのUI実装
- [x] 漫画追加フォームのUI実装
- [x] 漫画編集フォームのUI実装
- [x] 漫画削除機能のUI実装

### Slack設定

- [x] Slack Webhook取得API（GET /api/settings）
- [x] Slack Webhook保存API（POST /api/settings）
- [x] Slack設定ページのUI実装

### 通知機能

- [x] Slack通知送信関数の実装
- [x] Cronハンドラの実装（scheduledイベント）

## 認証機能

- [x] Basic認証ミドルウェアの実装（app/server.ts）
- [x] .dev.vars.example テンプレート作成
- [x] ローカルでの認証動作確認

### 完了

- [x] ローカルでの動作確認
- [ ] Cloudflareへのデプロイ
- [ ] 本番環境でsecretsを設定（BASIC_AUTH_USER, BASIC_AUTH_PASS）

</details>

---

# 新機能: 通知スケジュール拡張

## Phase 0: 準備・設計確認

### 目的
実装に必要な既存コードの把握と、型定義・ユーティリティ関数の設計

### 作業内容
- [ ] 既存のManga型定義の確認
- [ ] 新しい型定義の設計（ScheduleType, MangaWithSchedule等）
- [ ] スケジュール判定ロジックのユーティリティ関数設計

### 変更対象
- `app/types/` 配下（型定義）
- 新規: `app/lib/schedule-utils.ts`（予定）

### 完了条件
- 型定義が明確になっている
- ユーティリティ関数のインターフェースが決まっている

### ユーザー確認項目
- 型定義・関数設計のレビュー

---

## Phase 1: DBマイグレーション

### 目的
mangasテーブルに新カラムを追加し、既存データを移行

### 作業内容
- [ ] マイグレーションSQL作成（`0002_schedule_columns.sql`）
  - `schedule_type` カラム追加（DEFAULT 'weekly'）
  - `monthly_days` カラム追加
  - `base_date` カラム追加
- [ ] 既存データの移行SQL（schedule_type = 'weekly' に設定）
- [ ] ローカル環境でマイグレーション実行・確認

### 変更対象
- `migrations/0002_schedule_columns.sql`（新規）

### 完了条件
- マイグレーションがエラーなく実行できる
- 既存データが `schedule_type = 'weekly'` で移行されている
- `day_of_week` の既存値が保持されている

### ユーザー確認項目
- マイグレーションSQLの内容確認
- ローカルDBでのデータ確認

---

## Phase 2: 型定義・ユーティリティ関数実装

### 目的
スケジュール判定のコアロジックをTDDで実装

### 作業内容
- [ ] 型定義の更新（Manga, MangaRow, ScheduleType）
- [ ] スケジュール判定関数のテスト作成
  - `shouldNotifyWeekly(manga, today)`
  - `shouldNotifyBiweekly(manga, today)`
  - `shouldNotifyMonthly(manga, today)`
  - `shouldNotify(manga, today)` （統合関数）
- [ ] スケジュール判定関数の実装
- [ ] 次回通知日計算関数のテスト作成
  - `getNextBiweeklyDate(dayOfWeek, baseDate)`
- [ ] 次回通知日計算関数の実装

### 変更対象
- `app/types/manga.ts`（または該当ファイル）
- `app/lib/schedule-utils.ts`（新規）
- `app/lib/schedule-utils.test.ts`（新規）

### 完了条件
- 全テストがパスする
- 週次・隔週・月次の判定が正しく動作する
- 月末処理（存在しない日のスキップ）が正しく動作する

### ユーザー確認項目
- テストケースの網羅性確認
- ロジックの正確性確認

---

## Phase 3: Cronハンドラー更新

### 目的
新しいスケジュールパターンに対応した通知処理

### 作業内容
- [ ] Cronハンドラーのテスト更新
- [ ] Cronハンドラーの実装更新
  - 週次: 既存ロジック維持
  - 隔週: 基準日からの週数判定を追加
  - 月次: 日付判定を追加
- [ ] 統合テスト

### 変更対象
- `app/lib/cron-handler.ts`
- `app/lib/cron-handler.test.ts`（あれば）

### 完了条件
- 週次・隔週・月次すべてのパターンで正しく通知される
- 既存の週次通知が壊れていない

### ユーザー確認項目
- Cronハンドラーの動作確認（手動実行）

---

## Phase 4: API更新

### 目的
漫画の登録・更新APIで新しいスケジュール設定を受け付ける

### 作業内容
- [ ] POST /api/mangas のリクエスト/レスポンス更新
- [ ] PUT /api/mangas/:id のリクエスト/レスポンス更新
- [ ] GET /api/mangas のレスポンス更新
- [ ] バリデーション追加
  - schedule_type が有効な値か
  - weekly/biweekly 時に day_of_week が必須
  - monthly 時に monthly_days が必須（1-31の配列）
- [ ] APIテスト

### 変更対象
- `app/routes/api/mangas/` 配下
- `app/lib/db.ts`（DB操作関数）

### 完了条件
- 新しいスケジュール設定でCRUD操作ができる
- バリデーションエラーが適切に返される

### ユーザー確認項目
- APIの動作確認（curl等）

---

## Phase 5: フロントエンド - 登録・編集画面

### 目的
直感的なUIで通知スケジュールを設定できるようにする

### 作業内容
- [ ] 通知パターン選択UI（ラジオボタン/セグメントコントロール）
- [ ] 週次/隔週: 曜日選択UI
- [ ] 月次: 日付複数選択UI（1-31のチェックボックスまたはマルチセレクト）
- [ ] 隔週選択時の次回通知日プレビュー表示
- [ ] フォームバリデーション（クライアント側）
- [ ] 既存の編集画面が新スキーマで動作することを確認

### 変更対象
- `app/routes/` 配下のページコンポーネント
- `app/islands/` 配下（インタラクティブコンポーネント）

### 完了条件
- 3つのパターンから選択できる
- パターンに応じた入力フィールドが表示される
- 隔週選択時に次回通知日がプレビューされる
- 登録・編集が正常に動作する

### ユーザー確認項目
- UIの操作感確認
- 実際に登録・編集してみる

---

## Phase 6: フロントエンド - 一覧画面

### 目的
通知スケジュールを分かりやすく表示

### 作業内容
- [ ] 一覧画面のスケジュール表示更新
  - 週次: 「毎週 火曜」
  - 隔週: 「隔週 火曜」
  - 月次: 「毎月 12, 24日」
- [ ] スケジュール表示用のフォーマット関数作成

### 変更対象
- `app/routes/` 配下の一覧ページ
- `app/lib/format-utils.ts`（新規または既存）

### 完了条件
- 各パターンの漫画が正しい形式で表示される
- 既存の週次漫画も正しく表示される

### ユーザー確認項目
- 一覧画面の表示確認

---

## Phase 7: 統合テスト・最終確認

### 目的
全機能の統合テストと最終確認

### 作業内容
- [ ] E2Eシナリオテスト
  - 週次漫画の登録→一覧表示→通知
  - 隔週漫画の登録→一覧表示→通知
  - 月次漫画の登録→一覧表示→通知
  - 既存漫画の編集
- [ ] エッジケース確認
  - 月末処理（31日指定で30日までの月）
  - 隔週の基準日計算
- [ ] 既存機能のリグレッションテスト

### 変更対象
- なし（確認のみ）

### 完了条件
- 全シナリオが正常に動作する
- 既存機能が壊れていない

### ユーザー確認項目
- 最終動作確認
- 本番デプロイの判断
