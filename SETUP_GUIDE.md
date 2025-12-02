# 鉱山保安マネジメントシステム - セットアップガイド

## 📦 パッケージ内容

このアーカイブには以下が含まれています：

```
webapp/
├── src/                      # ソースコード
│   ├── components/          # Reactコンポーネント
│   ├── services/            # APIサービス
│   ├── pages/               # ページコンポーネント
│   ├── types/               # TypeScript型定義
│   ├── utils/               # ユーティリティ
│   └── data/                # サンプルデータ
├── server/                  # サーバーサイド
│   ├── log-server.cjs      # ログ保存サーバー
│   └── logs/               # ログファイル保存先
├── public/                  # 静的ファイル
├── dist/                    # ビルド済みファイル
├── package.json            # 依存関係
└── vite.config.ts          # ビルド設定
```

---

## 🚀 クイックスタート

### 必要な環境

- **Node.js**: v18以上
- **npm**: v9以上

### 1. アーカイブを展開

```bash
tar -xzf mining-safety-app-YYYYMMDD-HHMMSS.tar.gz
cd webapp
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

---

## 🏗️ 本番環境デプロイ

### ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### 静的ホスティング

任意のWebサーバーで `dist/` ディレクトリを公開できます：

```bash
# 簡易HTTPサーバー（テスト用）
cd dist
python3 -m http.server 8080
```

---

## 🔧 AI機能の設定

### Google Gemini API

1. [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを取得
2. アプリの⚙️ボタン → AI設定 → Google Gemini を選択
3. APIキーを入力して保存

### サテライトAI（公式API）

1. [サテライトAI AIボード](https://aiboard.sateraitoai.jp) でアカウント作成
2. ダッシュボードの「API設定」でAPIキーを発行
3. アプリの⚙️ボタン → AI設定 → サテライトAI を選択
4. 以下を入力：
   - APIキー
   - テナントID
   - ユーザーID（メールアドレス）

---

## 💾 ログサーバーの起動（オプション）

AIの入出力ログをサーバー側に保存する場合：

### 1. ログサーバーを起動

```bash
cd server
node log-server.cjs
```

デフォルトポート: `3001`  
ログ保存先: `server/logs/ai-logs.json`

### 2. フロントエンドで設定

アプリのログ画面 → ⚙️設定 → 保存先を「サーバー保存」に変更  
サーバーURL: `http://localhost:3001`

---

## 📊 機能一覧

### コア機能

| 機能 | 説明 |
|------|------|
| **ヒヤリハット報告** | 危険事象の記録・AI分析 |
| **リスクアセスメント** | リスク評価・低減措置提案 |
| **年間計画** | PDCAサイクルに基づく安全計画 |
| **会議・診断** | 安全会議記録・自己診断チェックリスト |
| **ダッシュボード** | 全体統計・トレンド分析 |

### AI機能

| 機能 | 対応プロバイダー |
|------|----------------|
| ヒヤリハット分析 | Gemini, サテライトAI |
| リスク低減措置提案 | Gemini, サテライトAI |
| 会議要約 | Gemini, サテライトAI |
| 改善提案生成 | Gemini, サテライトAI |
| 年間計画提案 | Gemini, サテライトAI |

### ログ機能

| 機能 | 説明 |
|------|------|
| **ブラウザ保存** | IndexedDB（無制限） |
| **サーバー保存** | JSON形式（複数人共有可能） |
| **両方に保存** | 冗長化 |
| **エクスポート** | JSON/CSV形式 |

---

## 🔒 データ保存について

### ブラウザ側（デフォルト）

- **保存先**: ブラウザのIndexedDB
- **容量**: 無制限（ブラウザ依存、通常数GB）
- **共有**: 不可（同一ブラウザのみ）
- **永続化**: ブラウザの永続ストレージAPIを使用可能

### サーバー側（オプション）

- **保存先**: `server/logs/ai-logs.json`
- **容量**: 無制限（ディスク容量依存）
- **共有**: 可能（同一サーバーに接続する全ユーザー）
- **バックアップ**: 100MB超過時に自動ローテーション

---

## 🌐 対応ブラウザ

- Chrome / Edge: 最新版推奨
- Firefox: 最新版推奨
- Safari: 最新版推奨

---

## 📝 環境変数（オプション）

### ログサーバー

以下の環境変数でログサーバーをカスタマイズできます：

```bash
# ポート番号
LOG_SERVER_PORT=3001

# ログ保存ディレクトリ
LOG_DIR=./logs

# ログファイル最大サイズ（バイト）
MAX_LOG_SIZE=104857600  # 100MB
```

使用例：

```bash
LOG_SERVER_PORT=8001 LOG_DIR=/var/logs/ai-logs node log-server.cjs
```

---

## 🛠️ トラブルシューティング

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### AI接続エラー

**Gemini API:**
- APIキーが正しいか確認
- [Google AI Studio](https://aistudio.google.com/app/apikey) でキーの有効性を確認

**サテライトAI:**
- APIキー、テナントID、ユーザーIDが正しいか確認
- ネットワーク接続を確認

### ログサーバー接続エラー

```bash
# サーバーが起動しているか確認
curl http://localhost:3001/api/health

# ファイアウォール設定を確認
# Windowsの場合: ファイアウォール設定でポート3001を許可
# Linuxの場合: sudo ufw allow 3001
```

---

## 📚 技術スタック

### フロントエンド

- **React** 18
- **TypeScript** 5
- **Tailwind CSS** 3
- **Vite** 5
- **Lucide Icons**

### バックエンド（ログサーバー）

- **Node.js** (CommonJS)
- **標準HTTP モジュール**

### AI統合

- **Google Gemini API**
- **サテライトAI 公式API**

### データストレージ

- **IndexedDB** (ブラウザ)
- **JSON ファイル** (サーバー)

---

## 🔐 セキュリティについて

### APIキーの保護

- APIキーはブラウザのlocalStorageに保存されます
- サーバーには送信されません（サテライトAI認証時を除く）
- 本番環境では環境変数や専用の秘密管理システムの使用を推奨

### データプライバシー

- ヒヤリハット報告等のデータはローカルストレージまたは指定したサーバーにのみ保存
- 外部サービスへのデータ送信はAI分析時のみ（ユーザーが明示的に実行した場合）

---

## 📄 ライセンス

このプロジェクトは社内使用を目的としています。

---

## 🆘 サポート

技術的な問題や質問がある場合は、プロジェクト管理者にお問い合わせください。

---

**最終更新**: 2025年12月2日  
**バージョン**: 1.0.0
