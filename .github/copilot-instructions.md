# VRC Avatar Switcher - AI コーディングエージェント向けガイド

## プロジェクト概要
**Tauri v2**（Rustバックエンド）+ **React**（TypeScriptフロントエンド）で構築されたデスクトップアプリケーション。VRChatアバターの管理と切り替えを行います。VRChat APIを使用した認証とアバター操作、ローカルSQLiteデータベースによるユーザー設定とタグ管理を実装しています。

## アーキテクチャ

### フロントエンド（React + TypeScript）
- **UIフレームワーク**: Mantine v8コンポーネント（`@mantine/core`、`@mantine/notifications`）
- **状態管理**: TanStack Query v5でサーバー状態を管理（Redux/Zustandは不使用）
- **Tauri呼び出し**: `@tauri-apps/api/core`のinvoke()でRustコマンドを呼び出し
- **データベースアクセス**: `@tauri-apps/plugin-sql`でフロントエンドから直接SQLiteクエリを実行

### バックエンド（Rust）
- **フレームワーク**: Tauri v2、`#[tauri::command]`マクロで関数を公開
- **APIクライアント**: `vrchatapi`クレート（v1.20.3）でVRChat APIとやり取り
- **認証管理**: `reqwest::cookie::Jar`にCookieベースの認証を保存、フロントエンドとバックエンド間で生文字列として受け渡し
- **データベース**: `tauri-plugin-sql`経由のSQLite、手動マイグレーションは`src-tauri/src/migrations.rs`で管理

### 主なデータフロー
1. フロントエンドが`invoke('command_name', { params })`を呼び出し → `src-tauri/src/commands.rs`のRustコマンドへ
2. Rustコマンドが保存された認証情報からcookie jarを作成 → VRChat API呼び出し → シリアライズされたデータを返却
3. フロントエンドのクエリ/ミューテーションがTanStack Queryキャッシュを更新 → SQLiteに設定/タグを保存
4. Cookie保存: auth_cookie + two_fa_cookieの文字列が`client_settings`テーブルに格納

## 重要なパターン

### コマンド呼び出しパターン
全てのRustコマンドは以下の構造に従います：
```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub async fn command_name(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    // その他のパラメータ
) -> Result<ReturnType, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    // configを使用したAPI呼び出し
}
```

`src/lib/commands.ts`のTypeScriptラッパー：
```typescript
export const command_name = async (
  rawAuthCookie: string,
  raw2faCookie: string,
  // その他のパラメータ
): Promise<ReturnType> => {
  return await invoke<ReturnType>('command_name', {
    rawAuthCookie,
    raw2faCookie,
    // camelCase → snake_case変換はTauriが自動処理
  });
};
```

### TanStack Queryによる状態管理
- **認証**: `App.tsx`の`['auth_check']`クエリキーでログイン状態を判定
- **アバターリスト**: `['avatar_list', sortOrder]`でVRChat APIからアバターを取得
- **タグ/リレーション**: `['tag_avatar_relations', avatarIds, userId]`でタグ関連付けを一括取得
- **設定**: `['avatar_sort_order']`、`['card_image_size']`などの個別クエリキー
- ミューテーション後は常に`queryClient.invalidateQueries()`でクエリを無効化する

### データベーススキーマ（`src-tauri/src/migrations.rs`）
```sql
-- ユーザーごとに所有されるタグ
tags (display_name, color, created_by) -- PK: (display_name, created_by)

-- アバターとタグの多対多リレーション
tag_avatar_relations (tag_display_name, avatar_id, created_by) -- PK: 3つ全て

-- クライアント設定（Cookie、環境設定）
client_settings (key, value) -- PK: key、UPSERTパターンを使用
```

### Cookie管理
- Cookieは生文字列として保存：`"auth=<value>"`と`"twoFactorAuth=<value>"`
- `src-tauri/src/cookie_jar.rs`のヘルパー関数で抽出/設定
- UI上でCookie値を公開しない - Rustコマンド間でのみ受け渡す
- アプリ起動時に`src/lib/db.ts`の`loadCookies()`でCookieを読み込み

### 2FA認証フロー
1. `command_new_auth()` → ステータスを返却：Success | Requires2FA | RequiresEmail2FA
2. 2FAが必要な場合 → コードと共に`command_2fa()`または`command_email_2fa()`を呼び出し
3. 成功 → `saveCookies()`でCookieを保存 → `['auth_check']`クエリを無効化

## 開発ワークフロー

### 開発モードでの実行
```powershell
pnpm dev          # Vite開発サーバー + Tauriアプリを起動
pnpm tauri dev    # 直接Tauriコマンドを実行する代替方法
```

### 本番ビルド
```powershell
pnpm tauri build  # src-tauri/target/release/bundle/ にインストーラを作成
```

### テスト
```powershell
pnpm test         # Vitestをウォッチモードで実行
pnpm test:ci      # CI用の単一テスト実行
```

### リント
```powershell
pnpm lint         # @tanstack/eslint-plugin-queryルールを使用したESLint
```

## よくあるタスク

### 新しいTauriコマンドの追加
1. `src-tauri/src/commands.rs`に`#[tauri::command]`付きで関数を定義
2. `src-tauri/src/lib.rs`の`invoke_handler![]`に追加
3. `src/lib/commands.ts`にTypeScriptラッパーを作成
4. Reactコンポーネント/フック内で`invoke()`経由で呼び出し

### データベーススキーマの変更追加
1. `src-tauri/src/migrations.rs`に新しい`Migration`構造体を追加（バージョンをインクリメント）
2. アプリ起動時に`tauri-plugin-sql::Builder`経由でデータベースが自動マイグレーション
3. `src/lib/db.ts`にTypeScriptクエリ/ミューテーション関数を追加

### 新しいUIコンポーネントの追加
- Mantineコンポーネントを使用し、レイアウト用に一貫したpropsを使用：`cardImageSize`、`cardNumberPerRow`
- `@mantine/notifications`の`notifications.show()`で通知を表示
- ファイル整理は`src/components/`の既存パターンに従う

### 型の同期
- TypeScript型（`src/lib/models.ts`）とRust型（`src-tauri/src/models.rs`）を同期させる
- Tauri公開型にはRustで`#[derive(Serialize, Deserialize)]`を使用
- VRChat API型は`vrchatapi`クレート（Avatar、CurrentUserなど）から取得

## プロジェクト固有の規約
- **ファイル命名**: ReactコンポーネントはPascalCase、ユーティリティはcamelCase
- **クエリキー**: TanStack Query用に`['resource', ...params]`配列形式
- **エラーハンドリング**: Rustコマンドは`Result<T, String>`を返し、フロントエンドはMantine通知で表示
- **ローカライゼーション**: UI文言は日本語（既存コンポーネント参照）
- **ユーザー分離**: 全てのタグ/設定操作はVRChat APIからの`currentUserId`でスコープ

## 外部依存関係
- **VRChat API**: 認証にはユーザー名/パスワードが必要（OAuthなし）、TOTP/Email 2FAをサポート
- **SQLite**: ローカルデータベースパス：アプリデータディレクトリ内の`vrc-avatar-switcher.db`
- **Tauriプラグイン**: `tauri-plugin-sql`、外部リンク用の`tauri-plugin-opener`

