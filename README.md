# 鉱山保安マネジメントシステム - ソースコードパッケージ

## 📦 パッケージ情報

**ファイル名**: `mining-safety-app-source-only.tar.gz`  
**サイズ**: 129KB  
**ファイル数**: 63ファイル  
**作成日**: 2025年12月2日

---

## ✨ 特徴

このパッケージには**実質的なファイルのみ**が含まれています：

✅ **自作ソースコード**（34ファイル）  
✅ **設定ファイル**（9ファイル）  
✅ **サーバーコード**（4ファイル）  
✅ **ドキュメント**（1ファイル）  

❌ **除外されているもの**：
- `node_modules/` (18,095ファイル) → `npm install` で再生成可能
- `.git/` (27ファイル) → バージョン管理履歴
- `dist/` (6ファイル) → `npm run build` で再生成可能

---

## 📂 含まれるファイル（63ファイル）

### 📁 ソースコード (src/) - 34ファイル

#### コンポーネント (19ファイル)
```
src/components/
├── Layout.tsx                    メインレイアウト
├── Dashboard.tsx                 ダッシュボード
├── IntegratedDashboard.tsx       統合ダッシュボード
├── ReportForm.tsx                ヒヤリハット報告フォーム
├── ReportList.tsx                報告一覧
├── Analysis.tsx                  分析画面
├── ApiKeySettings.tsx            AI API設定
├── AILogViewer.tsx               ログビューアー
├── ra/
│   ├── RADashboard.tsx          リスクアセスメント ダッシュボード
│   ├── RAList.tsx               リスクアセスメント 一覧
│   └── RAForm.tsx               リスクアセスメント フォーム
├── plan/
│   ├── PlanDashboard.tsx        年間計画 ダッシュボード
│   ├── PlanList.tsx             年間計画 一覧
│   ├── GanttChart.tsx           ガントチャート
│   └── PlanForm.tsx             年間計画 フォーム
└── meeting/
    ├── MeetingDashboard.tsx     会議 ダッシュボード
    ├── MeetingList.tsx          会議一覧
    ├── DiagnosisForm.tsx        自己診断フォーム
    └── MeetingForm.tsx          会議記録フォーム
```

#### サービス (3ファイル)
```
src/services/
├── geminiService.ts              Google Gemini API統合
├── satelliteAiService.ts         サテライトAI 公式API統合
└── logService.ts                 ログ保存サービス
```

#### 型定義 (4ファイル)
```
src/types/
├── index.ts                      基本型定義
├── ra.ts                         リスクアセスメント型
├── plan.ts                       年間計画型
└── meeting.ts                    会議型
```

#### データ (4ファイル)
```
src/data/
├── sampleData.ts                 サンプルデータ
├── raData.ts                     RAサンプル
├── planData.ts                   計画サンプル
└── meetingData.ts                会議サンプル
```

#### その他 (4ファイル)
```
src/
├── hooks/useLocalStorage.ts      ローカルストレージフック
├── App.tsx                       メインアプリケーション
├── main.tsx                      エントリーポイント
└── index.css                     グローバルスタイル
```

### ⚙️ 設定ファイル - 9ファイル

```
./
├── package.json                  プロジェクト設定・依存関係
├── package-lock.json             依存関係ロックファイル
├── vite.config.ts                Viteビルド設定
├── tsconfig.json                 TypeScript設定
├── tsconfig.node.json            Node用TypeScript設定
├── tailwind.config.js            Tailwind CSS設定
├── postcss.config.js             PostCSS設定
├── index.html                    HTMLテンプレート
└── SETUP_GUIDE.md                セットアップガイド
```

### 🖥️ サーバーコード (server/) - 4ファイル

```
server/
├── log-server.cjs                ログ保存サーバー (Node.js)
├── gemini-api.js                 Gemini API サーバー（旧版）
├── package.json                  サーバー依存関係
└── logs/
    └── ai-logs.json              ログファイル
```

### 📄 その他 - 2ファイル

```
./
└── public/
    └── favicon.svg               ファビコン
```

---

## 🚀 セットアップ手順

### 1. アーカイブを展開

```bash
tar -xzf mining-safety-app-source-only.tar.gz
cd webapp  # または展開先ディレクトリ
```

### 2. 依存関係をインストール

```bash
npm install
```

これで `node_modules/` (18,095ファイル) が自動生成されます。

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

### 4. 本番ビルド（オプション）

```bash
npm run build
```

ビルド成果物は `dist/` に出力されます。

---

## 💾 ログサーバー起動（オプション）

```bash
cd server
npm install  # 初回のみ
node log-server.cjs
```

デフォルトポート: `3001`

---

## 🔧 必要な環境

- **Node.js**: v18以上
- **npm**: v9以上
- **OS**: Windows, macOS, Linux

---

## 📊 ファイル統計

| カテゴリ | ファイル数 | 説明 |
|---------|----------|------|
| **自作ソースコード** | 34 | React/TypeScript コンポーネント |
| **設定ファイル** | 9 | package.json, tsconfig等 |
| **サーバー** | 4 | ログサーバー |
| **静的ファイル** | 2 | HTML, favicon |
| **ディレクトリ** | 14 | フォルダ構造 |
| **合計** | **63** | 実質的なファイルのみ |

---

## 🎯 主な機能

| 機能 | 説明 |
|------|------|
| **ヒヤリハット報告** | 危険事象の記録・AI分析 |
| **リスクアセスメント** | リスク評価・低減措置 |
| **年間安全計画** | PDCAサイクルベースの計画管理 |
| **会議記録** | 安全会議の記録・要約 |
| **自己診断** | マネジメントシステム評価 |
| **AIログ管理** | ブラウザ/サーバー保存、エクスポート |

---

## 🤖 AI統合

### Google Gemini API
- Gemini 2.5 Pro
- Gemini 2.0 Flash
- Gemini 1.5 Pro/Flash

### サテライトAI（公式API）
- GPT-5.1 / GPT-5-mini
- Claude 4.5 Opus / Sonnet
- Gemini 2.5 Pro/Flash
- Azure OpenAI

---

## 📝 ライセンス

このプロジェクトは社内使用を目的としています。

---

## 🆘 サポート

- **ドキュメント**: `SETUP_GUIDE.md` 参照
- **問い合わせ**: プロジェクト管理者まで

---

## 📌 重要な注意点

1. **初回セットアップ時は必ず `npm install` を実行**してください
2. `node_modules/` は含まれていません（自動生成されます）
3. API利用にはGeminiまたはサテライトAIのAPIキーが必要です
4. ログサーバーはオプションです（ブラウザ保存のみでも動作します）

---

**パッケージサイズ**: わずか 129KB！  
**展開後の推定サイズ**: 約 250MB（node_modules込み）

---

**作成日**: 2025年12月2日  
**バージョン**: 1.0.0
