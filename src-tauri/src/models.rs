/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>.
*/

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
