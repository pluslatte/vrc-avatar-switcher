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

use vrchatapi::{
    apis::{authentication_api::get_current_user, configuration::Configuration},
    models::CurrentUser,
};

pub async fn fetch_user_data(config: &Configuration) -> Result<CurrentUser, String> {
    match get_current_user(config).await.map_err(|e| e.to_string())? {
        vrchatapi::models::EitherUserOrTwoFactor::CurrentUser(current_user) => Ok(current_user),
        vrchatapi::models::EitherUserOrTwoFactor::RequiresTwoFactorAuth(_) => {
            Err("You are not logged in.".to_string())
        }
    }
}
