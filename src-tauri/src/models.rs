use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum CommandLoginStatus {
    Success,
    Requires2FA,
    RequiresEmail2FA,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct CommandLoginOk {
    status: CommandLoginStatus,
    auth_cookie: String,
    two_fa_cookie: Option<String>,
}

impl CommandLoginOk {
    pub fn new(
        status: CommandLoginStatus,
        auth_cookie: String,
        two_fa_cookie: Option<String>,
    ) -> Self {
        Self {
            status,
            auth_cookie,
            two_fa_cookie,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Command2FAOk {
    auth_cookie: String,
    two_fa_cookie: String,
}

impl Command2FAOk {
    pub fn new(auth_cookie: String, two_fa_cookie: String) -> Self {
        Self {
            auth_cookie,
            two_fa_cookie,
        }
    }
}
