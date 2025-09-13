mod auth;
mod avatars;
mod config;
mod cookie_jar;

use std::sync::Arc;

use reqwest::cookie::Jar;
use serde::{Deserialize, Serialize};
use vrchatapi::{
    apis::authentication_api::{verify2_fa, verify2_fa_email_code},
    models::{Avatar, TwoFactorAuthCode, TwoFactorEmailCode},
};

use crate::{
    auth::{get_new_auth_cookie_without_2fa, is_auth_cookie_valid, AuthCookieOk},
    avatars::fetch_avatars,
    config::{create_configuration, create_configuration_for_login},
    cookie_jar::{extract_cookies_from_jar, set_raw_cookies_into_jar},
};

#[tauri::command]
async fn command_fetch_avatars(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<Vec<Avatar>, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    fetch_avatars(&config).await
}

#[derive(Debug, Serialize, Deserialize)]
enum CommandLoginStatus {
    Success = 0,
    Requires2FA = 1,
    RequiresEmail2FA = 2,
}
#[derive(Debug, Serialize, Deserialize)]
struct CommandLoginOk {
    status: CommandLoginStatus,
    auth_cookie: String,
    two_fa_cookie: Option<String>,
}
#[tauri::command]
async fn command_new_auth(username: &str, password: &str) -> Result<CommandLoginOk, String> {
    let jar = Arc::new(Jar::default());
    let config = create_configuration_for_login(&jar, username, password)?;
    match get_new_auth_cookie_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk {
                status: CommandLoginStatus::Success,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
        }
        AuthCookieOk::RequiresEmail2FA => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk {
                status: CommandLoginStatus::RequiresEmail2FA,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
        }
        AuthCookieOk::Requires2FA => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(CommandLoginOk {
                status: CommandLoginStatus::Requires2FA,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Command2FAOk {
    auth_cookie: String,
    two_fa_cookie: String,
}
#[tauri::command]
async fn command_2fa(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
    username: &str,
    password: &str,
    two_fa_code: &str,
) -> Result<Command2FAOk, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;

    verify2_fa(&config, TwoFactorAuthCode::new(two_fa_code.to_string()))
        .await
        .map_err(|e| e.to_string())?;

    let config = create_configuration_for_login(&jar, username, password)?;
    match get_new_auth_cookie_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(Command2FAOk {
                auth_cookie: extract.0,
                two_fa_cookie: extract.1,
            })
        }
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
async fn command_email_2fa(
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
    match get_new_auth_cookie_without_2fa(&config).await? {
        AuthCookieOk::Success => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(Command2FAOk {
                auth_cookie: extract.0,
                two_fa_cookie: extract.1,
            })
        }
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
async fn command_check_auth(raw_auth_cookie: &str, raw_2fa_cookie: &str) -> Result<bool, String> {
    let jar = Arc::new(Jar::default());
    set_raw_cookies_into_jar(&jar, raw_auth_cookie, raw_2fa_cookie)?;
    let config = create_configuration(&jar)?;
    is_auth_cookie_valid(&config).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            command_fetch_avatars,
            command_new_auth,
            command_2fa,
            command_email_2fa,
            command_check_auth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
