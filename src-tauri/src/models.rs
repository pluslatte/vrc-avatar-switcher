/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
