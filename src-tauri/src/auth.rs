use std::sync::Arc;

use reqwest::cookie::Jar;
use vrchatapi::{
    apis::authentication_api::{get_current_user, verify2_fa},
    models::{
        EitherUserOrTwoFactor::{CurrentUser, RequiresTwoFactorAuth},
        TwoFactorAuthCode, Verify2FaResult,
    },
};

use crate::config::{create_configuration, create_configuration_for_login};

pub enum AuthCookieOk {
    Success,
    RequiresEmail2FA,
    Requires2FA,
}
pub async fn get_new_auth_cookie_without_2fa(
    jar: &Arc<Jar>,
    username: &str,
    password: &str,
) -> Result<AuthCookieOk, String> {
    let config = create_configuration_for_login(&jar, username, password)?;

    match get_current_user(&config).await.map_err(|e| e.to_string())? {
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
    }
}
