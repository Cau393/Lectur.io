# Lectur.io — Cursor Rules

Place this entire `.cursor/rules/` folder in your project root.

## File Overview

| File | Mode | When it applies |
|------|------|----------------|
| `core.mdc` | `always` | 毎回読み込み。Tech stack・DB schema・MVP制約 |
| `architecture.mdc` | `auto` | 新機能設計・コンポーネント設計時 |
| `api-patterns.mdc` | `auto` | `app/api/` 配下の作成・修正時 |
| `supabase.mdc` | `auto` | Supabaseクエリ・auth・RLS関連作業時 |
| `ai-sdk.mdc` | `auto` | AI生成ロジック・プロンプト作成時 |
| `review.mdc` | `manual` | `@review` で明示的に呼ぶ |

## Usage

### 自動適用（autoモード）
Cursorが作業内容を判断して自動でルールを読み込みます。
追加指示は不要です。

### レビュー時
チャットで以下のように呼び出してください：
```
@review この файルをレビューして
```

## Folder Structure
```
.cursor/
└── rules/
    ├── core.mdc          ← always
    ├── architecture.mdc  ← auto
    ├── api-patterns.mdc  ← auto
    ├── supabase.mdc      ← auto
    ├── ai-sdk.mdc        ← auto
    └── review.mdc        ← manual (@review)
```
