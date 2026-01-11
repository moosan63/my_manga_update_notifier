# TODO

## セットアップ

- [ ] HonoXプロジェクト作成（create-hono）
- [ ] wrangler.tomlの設定（D1バインディング、Cron設定）
- [ ] D1データベースの作成（wrangler d1 create）

## データベース

- [ ] mangasテーブルのマイグレーションSQL作成
- [ ] settingsテーブルのマイグレーションSQL作成
- [ ] マイグレーションの実行（ローカル）

## 漫画API

- [ ] 漫画一覧取得API（GET /api/mangas）
- [ ] 漫画追加API（POST /api/mangas）
- [ ] 漫画更新API（PUT /api/mangas/:id）
- [ ] 漫画削除API（DELETE /api/mangas/:id）

## 漫画UI

- [ ] 漫画一覧ページのUI実装
- [ ] 漫画追加フォームのUI実装
- [ ] 漫画編集フォームのUI実装
- [ ] 漫画削除機能のUI実装

## Slack設定

- [ ] Slack Webhook取得API（GET /api/settings）
- [ ] Slack Webhook保存API（POST /api/settings）
- [ ] Slack設定ページのUI実装

## 通知機能

- [ ] Slack通知送信関数の実装
- [ ] Cronハンドラの実装（scheduledイベント）

## 完了

- [ ] ローカルでの動作確認
- [ ] Cloudflareへのデプロイ
