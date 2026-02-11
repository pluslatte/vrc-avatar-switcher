## Context

現在、VRChat API 呼び出しエラー（認証失敗、アバター一覧取得失敗）が発生すると、アプリが操作不能な状態になる。

**現在の実装**:
- `App.tsx:46` — 認証エラー時に `<div>Error Auth: ...</div>` のみ表示し、早期リターン
- `MainAppShell.tsx:50` — アバター一覧エラー時に `<div>Error AvatarList: ...</div>` のみ表示し、早期リターン
- `useAvatarListQuery.ts:39` — エラー時に `throw new Error()` してクエリを失敗させる

これにより、ユーザーは再ログインやリフレッシュなどの操作ができず、アプリの再起動を強いられる。

**制約**:
- Tauri v2 + React 19 構成、バックエンド変更は不要
- TanStack Query v5 でエラーステート管理
- Mantine v8 の Notifications を活用

## Goals / Non-Goals

**Goals:**
- API エラー時でも通常の UI コンポーネントを表示し、ユーザーが操作を継続できる
- エラー発生時に Mantine Notifications で明確なエラーメッセージを表示
- 空データ（空配列、デフォルト値）でアプリを動作させ、リトライ機能を提供
- TanStack Query のエラーステートを活用しつつ、UI レンダリングを継続

**Non-Goals:**
- オフラインモードの実装（完全なローカルキャッシュや永続化）
- 自動リトライ機能（ユーザーが明示的にリトライする設計）
- VRChat API エラーの根本原因解決（サーバー側の問題は対象外）
- エラーログの詳細記録やデバッグ機能（基本的なコンソールログのみ）

## Decisions

### 1. エラー時の早期リターンを削除し、条件付きレンダリングに変更

**決定**: `App.tsx` と `MainAppShell.tsx` のエラー時早期リターンを削除し、エラーステートでも UI を表示する。

**根拠**:
- 早期リターンはユーザーを完全にブロックし、UX を損なう
- 条件付きレンダリングにより、エラー状態でも操作可能な UI を提供できる
- React のベストプラクティス（エラー境界やフォールバック UI）に準拠

**代替案**:
- ❌ エラー Boundary でラップ → UI 全体がフォールバックになり、同じ問題が発生
- ❌ モーダルでエラー表示 → 操作をブロックする点で改善にならない

### 2. TanStack Query でエラーを throw してキャッシュデータを保持

**決定**: `useAvatarListQuery.ts` でエラー時に `throw error` することで、TanStack Query がエラー状態を管理しつつ、前回取得したキャッシュデータを保持する。

**根拠**:
- TanStack Query v5 では、エラー時に throw しても `query.data` は前回の成功したデータを保持する（`structuralSharing` がデフォルトで有効）
- `query.isError` が true になることで、エラー状態を UI 側で検知できる
- `MainAppShell.tsx` でエラー時の早期リターンを削除することで、`query.data` に保持されたキャッシュデータを使用して UI を表示
- 最新の状態ではないかもしれないが、ユーザーが部分的にでもアプリを利用し続けられることが重要
- エラー通知で「前回のデータを表示しています」と明示し、ユーザーに状況を伝える

**実装パターン**:
```typescript
// useAvatarListQuery.ts
queryFn: async () => {
  if (!avatarSortOrder) throw new Error('avatarSortOrder is undefined');
  try {
    const { authCookie, twofaCookie } = await loadCookies();
    return {
      avatars: await command_fetch_avatars(authCookie, twofaCookie, avatarSortOrder),
      currentUser: await command_fetch_current_user(authCookie, twofaCookie),
    };
  } catch (error) {
    // エラー通知は簡潔に（リトライのたびに表示されるため）
    notifications.show({
      title: 'アバターの読み込みに失敗しました',
      message: (error as Error).message,
      color: 'red',
    });
    // エラーを throw することで TanStack Query がエラー状態を管理
    // query.data は前回のキャッシュデータを保持（TanStack Query v5 の仕様）
    throw error;
  }
}

// MainAppShell.tsx
// エラー状態でキャッシュデータを表示していることを UI で明示
{avatarListQuery.isError && avatarListQuery.data && (
  <Alert icon={<IconAlertCircle />} title="最新データの取得に失敗しました" color="orange">
    前回のデータを表示しています。ヘッダーのリフレッシュボタンから再試行できます。
  </Alert>
)}
```

**実際の実装**: エラー時に `throw error` することで、TanStack Query がエラー状態（`query.isError = true`）を管理しつつ、`query.data` には前回の成功したデータを保持する。`MainAppShell.tsx` でエラー時の早期リターンを削除し、`query.data?.avatars || []` でキャッシュデータまたは空配列を使用。初回エラー（キャッシュがない場合）は `query.data` が undefined となり、UI 側で空データとしてフォールバック UI を表示。

**代替案**:
- ❌ throw せずに空データを返す → 前回表示できていたアバターが消えてしまう。キャッシュを活用できない
- ❌ throw せずに何も返さない（undefined）→ キャッシュを上書きしてしまい、前回のデータが失われる
- ❌ `onError` で通知のみ、throw しない → エラー状態を管理できず、UI 側で適切なフォールバック処理ができない
- ❌ `suspense: true` で Suspense 境界 → エラー時に UI がアンマウントされる

### 3. 初回エラー時のフォールバック UI を追加

**決定**: `AvatarList.tsx` に空配列を受け取った際（初回エラーでキャッシュがない場合）のフォールバック UI を実装し、「アバターの読み込みに失敗しました」などのメッセージを表示。

**根拠**:
- 初回エラー時（キャッシュがない状態）は空配列になるため、フォールバック UI が必要
- 2回目以降のエラーは前回のキャッシュデータを表示するため、フォールバック UI は表示されない
- リフレッシュボタンで再試行を促す

**代替案**:
- ❌ 何も表示しない → ユーザーが混乱する
- ❌ ローディング状態を継続 → エラーが発生したことが伝わらない

### 4. 認証エラー時は `<LoginForm>` を表示

**決定**: `App.tsx` で認証エラー時も `<LoginForm>` を表示し、再ログインを促す。

**根拠**:
- 認証失敗は「未ログイン」と同等の状態として扱う
- ユーザーは再ログインフォームから再試行可能
- 既存の `onLoginSuccess` で認証成功後に状態をリセット

**実装パターン**:
```typescript
// App.tsx
return (
  <main>
    {query.isPending && <LoaderFullWindow message="認証情報を確認しています..." />}
    {query.isError && (
      <>
        {/* エラー通知は表示済み */}
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </>
    )}
    {query.data === true && <MainAppShell onLogoutSuccess={onLogoutSuccess} />}
    {query.data === false && <LoginForm onLoginSuccess={onLoginSuccess} />}
  </main>
);
```

### 5. Mantine Notifications で統一的なエラー通知

**決定**: すべての API エラーは `notifications.show()` で通知し、一貫した UX を提供。

**根拠**:
- 既存の通知システムを活用し、追加実装不要
- トースト形式で非ブロッキング、ユーザーは操作を継続できる
- `color: 'red'` で視覚的にエラーを強調

## Risks / Trade-offs

### リスク 1: 空データ表示による混乱

**リスク**: アバター一覧が空の場合、「本当にアバターがないのか」「エラーで取得できなかったのか」が区別しづらい。

**緩和策**:
- エラー通知を必ず表示し、「読み込みに失敗しました」と明示
- フォールバック UI に「リフレッシュして再試行」ボタンを追加

### リスク 2: 部分的なデータ取得失敗

**リスク**: `command_fetch_avatars` は成功したが `command_fetch_current_user` が失敗した場合、部分的なエラーが発生。

**緩和策**:
- どちらか一方でも失敗したら、両方とも空データを返す
- エラー通知で「ユーザー情報の取得に失敗」など具体的なメッセージを表示

### リスク 3: エラー状態の複雑化

**リスク**: エラーハンドリングロジックが複雑になり、バグが混入する可能性。

**緩和策**:
- TanStack Query のエラーハンドリングパターンに従う
- テストケースで空データ表示をカバー（`pnpm test` で確認）

### トレードオフ: ユーザビリティ vs. エラー明示性

**選択**: エラー時でも UI を表示し、操作を継続可能にする。

**トレードオフ**:
- ✅ ユーザビリティ向上（再試行可能、操作継続）
- ❌ エラーが目立ちにくくなる可能性（通知だけで見逃すリスク）

**判断**: Mantine Notifications の通知で十分にエラーを伝えられるため、ユーザビリティを優先。
