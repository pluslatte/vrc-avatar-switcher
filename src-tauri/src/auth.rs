/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

use vrchatapi::{
    apis::{
        authentication_api::{get_current_user, verify_auth_token},
        configuration::Configuration,
    },
    models::EitherUserOrTwoFactor::{CurrentUser, RequiresTwoFactorAuth},
};

pub enum AuthCookieOk {
    Success,
    RequiresEmail2FA,
    Requires2FA,
}
pub async fn try_login_without_2fa(config: &Configuration) -> Result<AuthCookieOk, String> {
    match get_current_user(config).await {
        Ok(ok) => match ok {
            CurrentUser(_) => Ok(AuthCookieOk::Success),
            RequiresTwoFactorAuth(auth_required) => {
                if auth_required
                    .requires_two_factor_auth
                    .contains(&String::from("emailOtp"))
                {
                    Ok(AuthCookieOk::RequiresEmail2FA)
                } else {
                    Ok(AuthCookieOk::Requires2FA)
                }
            }
        },
        Err(e) => match e {
            vrchatapi::apis::Error::ResponseError(resp) if resp.status == 401 => {
                Err(String::from("Invalid username or password"))
            }
            _ => Err(format!("Error during login: {e}")),
        },
    }
}

pub async fn is_auth_cookie_valid(config: &Configuration) -> Result<bool, String> {
    match verify_auth_token(config).await {
        Ok(result) => {
            if result.ok {
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(e) => Err(format!("Error verifying auth token: {e}")),
    }
}
