# 漫画更新通知アプリ

RSSに対応していない漫画の更新情報をSlackに通知するWebアプリケーション。

## 機能

- 漫画の登録・編集・削除
- 更新曜日の設定（毎週○曜日）
- 毎日0時（JST）に該当曜日の漫画をSlackへ通知

## 技術スタック

| 項目 | 技術 |
|------|------|
| 言語 | TypeScript |
| フレームワーク | HonoX |
| サーバー | Cloudflare Workers |
| データベース | Cloudflare D1 |
| スケジューラー | Cloudflare Workers Cron Triggers |
| スタイリング | Tailwind CSS |

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### ローカル開発

```bash
# D1マイグレーション（初回のみ）
npx wrangler d1 migrations apply DB --local

# 開発サーバー起動
npm run dev
```

http://localhost:5173/ でアクセス

### テスト

```bash
npm test
```

## デプロイ

詳細は [documents/20260112_user_instruction.md](documents/20260112_user_instruction.md) を参照。

```bash
# Cloudflare認証
npx wrangler login

# D1データベース作成
npx wrangler d1 create manga-update-notifier-db

# wrangler.json の database_id を更新後
npx wrangler d1 migrations apply DB --remote

# デプロイ
npm run deploy
```

## 使い方

1. アプリにアクセス
2. 「設定」からSlack Webhook URLを登録
3. 「+ 新規追加」から漫画を登録
4. 毎日0時（JST）に該当曜日の漫画がSlackに通知される

## ディレクトリ構成

```
├── app/
│   ├── components/     # UIコンポーネント
│   ├── lib/            # ビジネスロジック
│   ├── routes/         # ページ・API
│   └── server.ts       # エントリーポイント
├── migrations/         # D1マイグレーション
├── test/               # テスト
└── documents/          # ドキュメント
```

## ライセンス

MIT
