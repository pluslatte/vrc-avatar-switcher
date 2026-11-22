use vrchatapi::{
    apis::{
        authentication_api::{get_current_user, verify_auth_token},
        configuration::Configuration,
    },
    models::{
        RegisterUserAccount200Response::{CurrentUser, RequiresTwoFactorAuth},
        TwoFactorAuthType,
    },
};

use crate::models::LoginStatus;

pub async fn try_login_without_2fa(config: &Configuration) -> Result<LoginStatus, String> {
    match get_current_user(config).await {
        Ok(ok) => match ok {
            CurrentUser(_) => Ok(LoginStatus::Success),
            RequiresTwoFactorAuth(auth_required) => {
                if auth_required
                    .requires_two_factor_auth
                    .contains(&TwoFactorAuthType::EmailOtp)
                {
                    Ok(LoginStatus::RequiresEmail2FA)
                } else {
                    Ok(LoginStatus::Requires2FA)
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
        Ok(result) => Ok(result.ok),
        Err(e) => Err(format!("Error verifying auth token: {e}")),
    }
}
