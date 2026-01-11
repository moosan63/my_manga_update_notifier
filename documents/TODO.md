# TODO

## セットアップ

- [x] HonoXプロジェクト作成（create-hono）
- [x] wrangler.tomlの設定（D1バインディング、Cron設定）
- [ ] D1データベースの作成（wrangler d1 create）※リモート環境用

## データベース

- [x] mangasテーブルのマイグレーションSQL作成
- [x] settingsテーブルのマイグレーションSQL作成
- [x] マイグレーションの実行（ローカル）

## 漫画API

- [x] 漫画一覧取得API（GET /api/mangas）
- [x] 漫画追加API（POST /api/mangas）
- [x] 漫画更新API（PUT /api/mangas/:id）
- [x] 漫画削除API（DELETE /api/mangas/:id）

## 漫画UI

- [x] 漫画一覧ページのUI実装
- [x] 漫画追加フォームのUI実装
- [x] 漫画編集フォームのUI実装
- [x] 漫画削除機能のUI実装

## Slack設定

- [x] Slack Webhook取得API（GET /api/settings）
- [x] Slack Webhook保存API（POST /api/settings）
- [x] Slack設定ページのUI実装

## 通知機能

- [x] Slack通知送信関数の実装
- [x] Cronハンドラの実装（scheduledイベント）

## 完了

- [x] ローカルでの動作確認
- [ ] Cloudflareへのデプロイ
