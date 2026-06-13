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
- `src/lib/commands.ts` — Tauri invoke ラッパー（hooks はこちらを使う）
- `src/lib/db/` — SQLite アクセス層（`tags.ts` / `settings.ts`、`@/lib/db` で import）
- `src/lib/queryKeys.ts` — TanStack Query キーの一元管理
- `src/lib/notify.ts` — エラーメッセージ抽出 + Mantine 通知ヘルパー
- `src/lib/models.ts` — TypeScript 型定義（`Tag` 含む）
- `src-tauri/src/commands.rs` — Tauri コマンド実装
- `src-tauri/src/session.rs` — セッション（cookie）の保持・永続化
- `src-tauri/src/auth.rs` — VRChat 認証ロジック
- `src-tauri/src/models.rs` — Rust 型定義（Serialize/Deserialize）

## 重要なパターン

### コマンド呼び出し規約
セッション（cookie jar）は Rust 側の `SessionState`（managed state）が保持し、各コマンドは `tauri::State<SessionState>` から jar を取得して VRChat API を呼び出す。フロントエンドは認証情報に一切触れない。TypeScript 側は camelCase で渡す（Tauri が自動変換）。Result<T, String> を返す。

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
Cookie は生文字列 `"auth=<value>"` / `"twoFactorAuth=<value>"` で、Rust が `session.json`（app config dir、webview から到達不能）に永続化する。`cookie_jar.rs` のヘルパーで jar との抽出/設定を行う。

## よくあるタスク

### 新しい Tauri コマンド追加
1. `src-tauri/src/commands.rs` に `#[tauri::command]` 関数定義
2. `src-tauri/src/lib.rs` の `invoke_handler![]` に登録
3. `src/lib/commands.ts` に TypeScript ラッパー作成

### DB スキーマ変更
1. `src-tauri/src/migrations.rs` に新しい `Migration` 追加（バージョンインクリメント）
2. `src/lib/db/` の該当モジュールに TS クエリ関数追加

**注意**: sqlx は適用済みマイグレーションの checksum を検証するため、既存の `sql` 文字列は空白含め変更禁止（既存環境が起動不能になる）。変更は必ず新バージョンの追加で行う。

### DB 層のテスト
`src/lib/db/*.test.ts` は本物のインメモリ SQLite（`node:sqlite`）で動く。`src/test/inMemoryDb.ts` の `createTestDb()` が `migrations.rs` をパースして同じスキーマを適用する（`PRAGMA foreign_keys = ON` 込み）。テストファイルでは `vi.mock('@/lib/db/client')` で `getDb()` を差し替える既存パターンに倣うこと。

### UI・フックのテスト
VRChat API には触れず、`vi.mock('@/lib/commands')` で Tauri コマンド境界をモックする。コンポーネントは `src/test/testUtils.tsx` の `renderWithProviders()`（MantineProvider + QueryClientProvider）、フックは `renderHook` + `createQueryWrapper()` で描画する。jsdom 用の Mantine ポリフィルは `src/test/setup.ts`（vitest の setupFiles）にある。通知の検証は `vi.spyOn(notifications, 'show')`。Tauri コマンドの reject は Error ではなく string なので、失敗ケースのモックは `mockRejectedValue('メッセージ')` とする。

### 型の同期
`src/lib/models.ts`（TS）と `src-tauri/src/models.rs`（Rust）を同期させる。VRChat API 型は `vrchatapi` クレートから取得。

## 規約
- React コンポーネント: PascalCase、ユーティリティ: camelCase
- エラー表示: Mantine `notifications.show()`
- 全データ操作は `currentUserId` でスコープ（ユーザー分離）
- ESLint: セミコロン必須、シングルクォート
