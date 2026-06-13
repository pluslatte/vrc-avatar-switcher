// 認証状態。
// - checking:     認証確認中
// - authenticated: 認証済み
// - needs-reauth:  セッションはあるが無効（再ログインが必要）
// - logged-out:    セッションがそもそも無い（未ログイン）
export type AuthStatus = 'checking' | 'authenticated' | 'needs-reauth' | 'logged-out';
