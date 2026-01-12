# ユーザー作業手順書（2026/01/12）

## 概要
漫画更新通知アプリのローカル実装が完了しました。
以下の手順でCloudflareへのデプロイを行ってください。

---

## 1. Cloudflare アカウント準備

### 1.1 Cloudflareアカウントの確認
- Cloudflareアカウントをお持ちでない場合は作成
- https://dash.cloudflare.com/

### 1.2 Wrangler ログイン
```bash
npx wrangler login
```
ブラウザが開くので、Cloudflareアカウントで認証してください。

---

## 2. D1データベースの作成

### 2.1 リモートD1データベースを作成
```bash
npx wrangler d1 create manga-update-notifier-db
```

### 2.2 出力されたdatabase_idをコピー
以下のような出力が表示されます：
```
✅ Successfully created DB 'manga-update-notifier-db'

[[d1_databases]]
binding = "DB"
database_name = "manga-update-notifier-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← これをコピー
```

### 2.3 wrangler.json を更新
`wrangler.json` の `database_id` を実際のIDに置き換え：
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "manga-update-notifier-db",
    "database_id": "ここに実際のIDを貼り付け"
  }
]
```

### 2.4 リモートDBにマイグレーション適用
```bash
npx wrangler d1 migrations apply DB --remote
```

---

## 3. Basic認証の設定

### 3.1 本番環境用のsecretsを設定
```bash
# ユーザー名を設定（入力を求められます）
npx wrangler secret put BASIC_AUTH_USER

# パスワードを設定（入力を求められます）
npx wrangler secret put BASIC_AUTH_PASS
```

---

## 4. デプロイ

### 4.1 ビルド＆デプロイ
```bash
npm run deploy
```

### 4.2 デプロイ完了後
出力されたURLにアクセスして動作確認：
```
https://manga-update-notifier.<your-subdomain>.workers.dev/
```

---

## 5. Slack Webhook URLの設定

### 5.1 Slack Incoming Webhookを作成
1. https://api.slack.com/apps にアクセス
2. 「Create New App」→「From scratch」
3. アプリ名と通知先ワークスペースを選択
4. 「Incoming Webhooks」を有効化
5. 「Add New Webhook to Workspace」で通知先チャンネルを選択
6. 生成されたWebhook URLをコピー

### 5.2 アプリで設定
1. デプロイしたアプリにアクセス
2. 右上の「設定」をクリック
3. Slack Webhook URLを貼り付けて「保存する」

---

## 6. 動作確認

### 6.1 漫画を登録
1. トップページで「+ 新規追加」をクリック
2. タイトル、URL、更新曜日を入力して保存

### 6.2 Cron動作確認（任意）
手動でCronをテストする場合：
```bash
npx wrangler dev --test-scheduled
```
別ターミナルで：
```bash
curl "http://localhost:8787/__scheduled?cron=0+15+*+*+*"
```

---

## 7. 注意事項

- Cronは毎日 UTC 15:00（JST 0:00）に実行されます
- 該当曜日の漫画がある場合のみSlackに通知されます
- Webhook URLが未設定の場合、通知はスキップされます
- Basic認証が必須です（secretsが未設定の場合、アクセスできません）

---

## トラブルシューティング

### デプロイエラーが出る場合
```bash
npx wrangler whoami  # ログイン状態確認
npx wrangler login   # 再ログイン
```

### D1エラーが出る場合
```bash
npx wrangler d1 list  # DB一覧確認
npx wrangler d1 migrations list DB --remote  # マイグレーション状態確認
```

### ログ確認
```bash
npx wrangler tail  # リアルタイムログ
```
