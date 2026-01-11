# 漫画更新通知アプリ 仕様書

## 概要

RSSに対応していない漫画の更新情報をSlackに通知するWebアプリケーション。

## 機能要件

### 漫画管理機能

- **登録情報**
  - 漫画のタイトル
  - 漫画のページURL
  - 更新予定日（毎週○曜日形式）

- **操作**
  - 一覧表示
  - 追加
  - 編集
  - 削除

### Slack通知機能

- 毎日0時（JST）に実行
- 当日の曜日に該当する漫画をSlackに通知
- 1件ずつ「タイトル」「漫画のページURL」を投稿

### Slack設定機能

- Webhook URLをWeb画面から設定可能
- 設定の保存・更新

## 非機能要件

### ユーザー

- 自分専用（認証なし）

### 技術スタック

| 項目 | 技術 |
|------|------|
| 言語 | TypeScript |
| フレームワーク | HonoX |
| サーバー | Cloudflare Workers |
| データベース | Cloudflare D1 |
| スケジューラー | Cloudflare Workers Cron Triggers |

## データベース設計

### mangasテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| title | TEXT | 漫画タイトル |
| url | TEXT | 漫画ページURL |
| day_of_week | INTEGER | 更新曜日（0=日, 1=月, ..., 6=土） |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

### settingsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| key | TEXT | 設定キー（主キー） |
| value | TEXT | 設定値 |
