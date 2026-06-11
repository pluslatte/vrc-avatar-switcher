# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

VRChat アバター管理・切替デスクトップアプリ。**Tauri v2**（Rust バックエンド）+ **React**（TypeScript フロントエンド）構成。パッケージマネージャは **pnpm**。UI は日本語。

## コマンド

```powershell
pnpm dev              # 開発モード（Vite + Tauri）
pnpm tauri build      # 本番ビルド → src-tauri/target/release/bundle/
pnpm lint             # ESLint（TanStack Query プラグイン含む）
pnpm test             # Vitest ウォッチモード
pnpm test:ci          # Vitest 単発実行（CI用）
```

## アーキテクチャ

### フロントエンド（`src/`）
- **React 19** + **TypeScript 5.8** + **Vite 7**
- **Mantine v8** で UI 構築（ダークモード固定）
- **TanStack Query v5** でサーバー状態管理（Redux/Zustand 不使用）
- `@tauri-apps/api/core` の `invoke()` で Rust コマンド呼び出し
- `@tauri-apps/plugin-sql` でフロントエンドから SQLite 直接アクセス
- パスエイリアス: `@/*` → `src/*`

### バックエンド（`src-tauri/`）
- **Tauri v2**（Rust）、`#[tauri::command]` で関数公開
- `vrchatapi` クレート（カスタムフォーク）で VRChat API 呼び出し
- `reqwest::cookie::Jar` による Cookie ベース認証
- SQLite は `tauri-plugin-sql` 経由、マイグレーションは `src-tauri/src/migrations.rs`

### 主要ファイル
- `src/lib/commands.ts` — Tauri invoke ラッパー（生 cookie を引数で受け取る低レベル層）
- `src/lib/api.ts` — 保存済み cookie を読み込んでコマンドを呼ぶセッション層（hooks はこちらを使う）
- `src/lib/db/` — SQLite アクセス層（`tags.ts` / `settings.ts` / `cookies.ts`、`@/lib/db` で import）
- `src/lib/queryKeys.ts` — TanStack Query キーの一元管理
- `src/lib/notify.ts` — エラーメッセージ抽出 + Mantine 通知ヘルパー
- `src/lib/models.ts` — TypeScript 型定義（`Tag` 含む）
- `src-tauri/src/commands.rs` — Tauri コマンド実装
- `src-tauri/src/auth.rs` — VRChat 認証ロジック
- `src-tauri/src/models.rs` — Rust 型定義（Serialize/Deserialize）

## 重要なパターン

### コマンド呼び出し規約
Rust コマンドは全て `raw_auth_cookie` + `raw_2fa_cookie` を受け取り、cookie jar を構築して VRChat API を呼び出す。TypeScript 側は camelCase で渡す（Tauri が自動変換）。Result<T, String> を返す。フロントエンドでは原則 `src/lib/api.ts` 経由で呼び出し、cookie を明示的に扱うログインフローのみ `src/lib/commands.ts` を直接使う。

### TanStack Query キー
キーは必ず `src/lib/queryKeys.ts` の `queryKeys` から取得すること。
- `queryKeys.authCheck` → `['auth_check']` — 認証状態
- `queryKeys.avatarList(sortOrder)` → `['avatar_list', sortOrder]` — アバター一覧
- `queryKeys.tagAvatarRelations(userId, avatarIds)` → `['tag_avatar_relations', userId, avatarIds]` — タグ関連付け
- `queryKeys.availableTags(userId)` → `['available_tags', userId]` — タグ一覧
- `queryKeys.avatarSortOrder` / `queryKeys.cardImageSize` / `queryKeys.cardNumberPerRow` — 設定

ミューテーション後は `queryClient.invalidateQueries()` で無効化すること。無効化はプレフィックスキー（`queryKeys.avatarListAll`、`queryKeys.tagAvatarRelationsAll(userId)`）を使うと配下をまとめて無効化できる。

### DB スキーマ（`migrations.rs`）
- `tags` — PK: (display_name, created_by)
- `tag_avatar_relations` — PK: (tag_display_name, avatar_id, created_by)、CASCADE 付き FK
- `client_settings` — PK: key、UPSERT パターン使用

### Cookie 管理
Cookie は生文字列 `"auth=<value>"` / `"twoFactorAuth=<value>"` で `client_settings` テーブルに保存（TS 側は `src/lib/db/cookies.ts`）。Rust 側は `cookie_jar.rs` のヘルパーで抽出/設定。

## よくあるタスク

### 新しい Tauri コマンド追加
1. `src-tauri/src/commands.rs` に `#[tauri::command]` 関数定義
2. `src-tauri/src/lib.rs` の `invoke_handler![]` に登録
3. `src/lib/commands.ts` に TypeScript ラッパー作成

### DB スキーマ変更
1. `src-tauri/src/migrations.rs` に新しい `Migration` 追加（バージョンインクリメント）
2. `src/lib/db/` の該当モジュールに TS クエリ関数追加

### 型の同期
`src/lib/models.ts`（TS）と `src-tauri/src/models.rs`（Rust）を同期させる。VRChat API 型は `vrchatapi` クレートから取得。

## 規約
- React コンポーネント: PascalCase、ユーティリティ: camelCase
- エラー表示: Mantine `notifications.show()`
- 全データ操作は `currentUserId` でスコープ（ユーザー分離）
- ESLint: セミコロン必須、シングルクォート
