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
pub struct CommandLoginOk {
    pub status: CommandLoginStatus,
    pub auth_cookie: String,
    pub two_fa_cookie: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Command2FAOk {
    pub auth_cookie: String,
    pub two_fa_cookie: String,
}
