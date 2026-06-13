use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum AvatarSortOption {
    Name,
    Updated,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum CommandLoginStatus {
    Success,
    Requires2FA,
    RequiresEmail2FA,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum CommandAuthState {
    /// セッション（auth cookie）がそもそも無い
    LoggedOut,
    /// auth cookie はあるが無効
    NeedsReauth,
    /// 認証済み
    Authenticated,
}
