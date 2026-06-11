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
