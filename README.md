# 漫画更新通知アプリ

RSSに対応していない漫画の更新情報をSlackに通知するWebアプリケーション。

## 機能

- 漫画の登録・編集・削除
- 更新曜日の設定（毎週○曜日）
- 毎日0時（JST）に該当曜日の漫画をSlackへ通知
- Basic認証によるアクセス制限

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

# Basic認証の設定（.dev.varsを作成）
cp .dev.vars.example .dev.vars
# .dev.varsを編集してユーザー名・パスワードを設定

# 開発サーバー起動
npm run dev
```

http://localhost:5173/ でアクセス（Basic認証が求められます）

### 開発コマンド一覧

| コマンド | 用途 |
|---------|------|
| `npm run dev` | Vite開発サーバー（HMR対応） |
| `npm run preview` | Workersランタイムでローカルプレビュー |
| `npm run preview:remote` | リモートDBでプレビュー |
| `npm run test` | テスト実行 |

### テスト

```bash
npm test
```

## デプロイ

詳細は [documents/20260112_user_instruction.md](documents/20260112_user_instruction.md) を参照。

### 初回セットアップ

```bash
# 1. Cloudflare認証
npx wrangler login

# 2. D1データベース作成
npx wrangler d1 create manga-update-notifier-db

# 3. wrangler.json の database_id を更新後、マイグレーション適用
npx wrangler d1 migrations apply DB --env production --remote

# 4. Basic認証のsecrets設定
npx wrangler secret put BASIC_AUTH_USER --env production
npx wrangler secret put BASIC_AUTH_PASS --env production

# 5. デプロイ
npm run deploy
```

### 更新デプロイ

```bash
npm run deploy
```

### Workerの管理

```bash
# デプロイ済みWorkerの一覧確認
npx wrangler deployments list

# 不要なWorkerを削除
npx wrangler delete <worker-name>
```

または [Cloudflareダッシュボード](https://dash.cloudflare.com/) → Workers & Pages から管理

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
