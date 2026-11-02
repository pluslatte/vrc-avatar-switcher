use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum AvatarSortOption {
    Name,
    Updated,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum LoginStatus {
    Success,
    Requires2FA,
    RequiresEmail2FA,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum CommandAuthState {
    LoggedOut,
    NeedsReauth,
    Authenticated,
}
