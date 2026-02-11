## 1. App.tsx のエラーハンドリング改善

- [x] 1.1 `App.tsx:46` の認証エラー時の早期リターン `{query.isError && <div>Error Auth: ...</div>}` を削除
- [x] 1.2 認証エラー時に `<LoginForm>` を表示するよう条件分岐を変更（`query.isError` 時も `<LoginForm onLoginSuccess={onLoginSuccess} />` を表示）
- [x] 1.3 認証チェックの `useQuery` に `onError` または `queryFn` 内でエラー通知を追加（`notifications.show({ title: '認証に失敗しました', message: ..., color: 'red' })`）

## 2. useAvatarListQuery のエラーハンドリング変更

- [x] 2.1 `useAvatarListQuery.ts:39` の `throw new Error(...)` を削除（エラー時に TanStack Query がキャッシュデータを保持するため）
- [x] 2.2 `catch` ブロック内で通知を表示し、エラーをキャッチするが再 throw しない（キャッシュデータが保持される）
- [x] 2.3 エラー通知をシンプルに変更（リトライのたびに表示されるため、簡潔にする。`notifications.show({ title: 'アバターの読み込みに失敗しました', message: error.message, color: 'red' })`）

## 3. MainAppShell.tsx のエラーハンドリング改善

- [x] 3.1 `MainAppShell.tsx:50` のアバター一覧エラー時の早期リターン `{avatarListQuery.isError && <div>Error AvatarList: ...</div>}` を削除
- [x] 3.2 `avatarListQuery.data` が空データでも `<AppShell>` を正常にレンダリングするよう条件分岐を調整（`avatarListQuery.data?.avatars` などのオプショナルチェーン追加）
- [x] 3.3 ヘッダーやフッターでユーザー情報が空の場合の表示を確認（デフォルト値で問題なく動作するか）
- [x] 3.4 エラー時にキャッシュデータを表示していることを明示する Alert バナーを追加（`avatarListQuery.isError && avatarListQuery.data` の場合に表示）

## 4. AvatarList.tsx の初回エラー時フォールバック UI 追加

- [x] 4.1 `AvatarList.tsx` に空配列チェックを追加（`avatars.length === 0` の場合、初回エラーでキャッシュがない状態）
- [x] 4.2 空配列時のフォールバック UI を実装（Mantine の `Text` や `Center` コンポーネントで「アバターの読み込みに失敗しました」メッセージを表示）
- [x] 4.3 フォールバック UI にリフレッシュボタンを追加（`<Button>` で `AvatarListRefreshButton` コンポーネントを呼び出すか、親コンポーネントから渡されたリフレッシュ関数を実行）

## 5. エラー通知の統合確認

- [x] 5.1 認証エラー時に Mantine Notifications でエラー通知が表示されることを確認
- [x] 5.2 アバター一覧取得エラー時に既存の通知が正しく表示されることを確認
- [x] 5.3 通知が非ブロッキング（トースト形式）で表示され、UI 操作を妨げないことを確認

## 6. テストと検証

- [x] 6.1 認証失敗時の動作を手動テスト（無効な Cookie でログイン試行 → `<LoginForm>` 表示確認）
- [x] 6.2 アバター一覧取得失敗時の動作を手動テスト（ネットワークエラーシミュレート → 空データで UI 表示確認）
- [x] 6.3 リトライ機能の動作を確認（再ログイン後に `queryClient.invalidateQueries(['auth_check'])` で状態リセット、リフレッシュボタンでアバター一覧再取得）
- [x] 6.4 既存の機能が正常動作することを確認（正常な認証・アバター表示が影響を受けていないか）
- [x] 6.5 `pnpm lint` を実行してコードスタイルを確認
