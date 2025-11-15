use std::sync::Arc;

use reqwest::cookie::Jar;
use tauri_plugin_log::log;
use vrchatapi::{
    apis::authentication_api::{verify2_fa, verify2_fa_email_code},
    models::{Avatar, CurrentUser, TwoFactorAuthCode, TwoFactorEmailCode},
};

use crate::{
    api_config::{create_configuration, create_configuration_for_login},
    auth::{is_auth_cookie_valid, try_login_without_2fa, AuthCookieOk},
    avatars::{self, fetch_avatars},
    cookie_jar::{extract_cookies_from_jar, set_raw_cookies_into_jar},
    models::{AvatarSortOption, Command2FAOk, CommandLoginOk, CommandLoginStatus},
    users,
};

#[tauri::command]
pub async fn command_fetch_avatars(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    sort_option: AvatarSortOption,
) -> Result<Vec<Avatar>, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;

    let sort_option = match sort_option {
        AvatarSortOption::Name => vrchatapi::models::SortOption::Name,
        AvatarSortOption::Updated => vrchatapi::models::SortOption::Updated,
    };

    fetch_avatars(&config, sort_option).await
}

#[tauri::command]
pub async fn command_new_auth(username: &str, password: &str) -> Result<CommandLoginOk, String> {
    let jar = Arc::new(Jar::default());
    let config = create_configuration_for_login(&jar, username, password)?;
    match try_login_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk::new(
                CommandLoginStatus::Success,
                auth_cookie,
                Some(two_fa_cookie),
            ))
        }
        AuthCookieOk::RequiresEmail2FA => {
            let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk::new(
                CommandLoginStatus::RequiresEmail2FA,
                auth_cookie,
                Some(two_fa_cookie),
            ))
        }
        AuthCookieOk::Requires2FA => {
            let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk::new(
                CommandLoginStatus::Requires2FA,
                auth_cookie,
                Some(two_fa_cookie),
            ))
        }
    }
}

#[tauri::command]
pub async fn command_2fa(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    username: &str,
    password: &str,
    two_fa_code: &str,
) -> Result<Command2FAOk, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;

    log::info!("Verifying 2FA code...");
    verify2_fa(&config, TwoFactorAuthCode::new(two_fa_code.to_string()))
        .await
        .map_err(|e| e.to_string())?;

    log::info!("2FA code verified. Attempting to log in...");
    let config = create_configuration_for_login(&jar, username, password)?;
    match try_login_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(&jar);
            Ok(Command2FAOk::new(auth_cookie, two_fa_cookie))
        }
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
pub async fn command_email_2fa(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    username: &str,
    password: &str,
    two_fa_code: &str,
) -> Result<Command2FAOk, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;

    verify2_fa_email_code(&config, TwoFactorEmailCode::new(two_fa_code.to_string()))
        .await
        .map_err(|e| e.to_string())?;

    let config = create_configuration_for_login(&jar, username, password)?;
    match try_login_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(&jar);
            Ok(Command2FAOk::new(auth_cookie, two_fa_cookie))
        }
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
pub async fn command_check_auth(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<bool, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    is_auth_cookie_valid(&config).await
}

#[tauri::command]
pub async fn command_fetch_current_user(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<CurrentUser, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    users::fetch_user_data(&config).await
}

#[tauri::command]
pub async fn command_switch_avatar(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    avatar_id: &str,
) -> Result<CurrentUser, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    avatars::switch_avatar(&config, avatar_id).await
}
