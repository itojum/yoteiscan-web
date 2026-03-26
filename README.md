# YoteiScan

あらゆる媒体から予定を抽出し、Google カレンダーに登録できる Web アプリです。

テキスト・画像・音声・リンク・ファイルを入力すると、AI が予定を解析して Google カレンダー登録用のリンクを生成します。

## 機能

| 入力タイプ | 説明 |
|----------|------|
| **テキスト** | メール・チャット・メモなどをペーストして解析 |
| **画像** | スクリーンショットやチラシをアップロード |
| **音声** | マイクで話した内容をリアルタイム文字起こし |
| **リンク** | Web ページの URL を入力してページ内容を解析 |
| **ファイル** | PDF・TXT・MD ファイルをアップロード |

- 解析は Google Gemini 2.5 Flash が実行
- 抽出された予定ごとに Google カレンダー登録ボタンを表示
- 認証・データ保存なし（セッションストレージのみ使用）
- PWA 対応（ホーム画面へのインストール可）
- レート制限: IP ごとに 1 時間あたり 5 回

## セットアップ

### 必要なもの

- [Bun](https://bun.sh/) または Node.js 18+
- [Google AI Studio](https://aistudio.google.com/apikey) の API キー

### 手順

```bash
# 依存関係のインストール
bun install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して GEMINI_API_KEY を設定

# 開発サーバー起動
bun dev
```

ブラウザで http://localhost:3000 を開いてください。

## 環境変数

| 変数 | 説明 |
|-----|------|
| `GEMINI_API_KEY` | Google AI Studio の API キー（必須） |

## 開発

```bash
bun dev          # 開発サーバー起動
bun build        # プロダクションビルド
bun test         # テスト実行
bun test:watch   # テスト監視モード
bun lint         # ESLint 実行
```

## テスト

Vitest を使用した単体・統合テストが含まれています。

```
__tests__/
  lib/
    schemas.test.ts       # Zod スキーマ・isEventComplete
    rateLimit.test.ts     # レート制限ロジック（フェイクタイマー使用）
    calendarUrl.test.ts   # Google Calendar URL 生成
    gemini.test.ts        # Gemini API ラッパー（モック使用）
  api/
    extract.test.ts       # API エンドポイント統合テスト
```

テスト実行時は `GEMINI_API_KEY` に自動でプレースホルダーが設定されるため、実際の API キーは不要です。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **UI**: React 19 / Tailwind CSS 4
- **言語**: TypeScript 5
- **AI**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **スキーマ検証**: Zod 4
- **PDF 解析**: pdf-parse 2
- **音声入力**: Web Speech API（ブラウザネイティブ）
- **テスト**: Vitest 4
- **パッケージマネージャー**: Bun
