mod auth;
mod avatars;
mod config;

use std::sync::Arc;

use reqwest::cookie::{self, Jar};
use serde::{Deserialize, Serialize};
use tauri::http::HeaderValue;
use vrchatapi::{
    apis::authentication_api::{verify2_fa, verify2_fa_email_code},
    models::{Avatar, TwoFactorAuthCode, TwoFactorEmailCode},
};

use crate::{
    auth::{get_new_auth_cookie_without_2fa, AuthCookieOk},
    avatars::fetch_avatars,
    config::{create_configuration, set_raw_cookies_into_jar},
};

fn extract_cookies_from_jar<C>(jar: &Arc<C>) -> (String, String)
where
    C: cookie::CookieStore + 'static,
{
    let cookies = jar
        .cookies(&url::Url::parse("https://api.vrchat.cloud").expect("Invalid URL"))
        .unwrap_or(HeaderValue::from_str("").unwrap());

    let auth_cookie = cookies
        .to_str()
        .unwrap_or("")
        .split(';')
        .find(|cookie| cookie.trim().starts_with("auth="))
        .map(|cookie| cookie.trim().to_string())
        .unwrap_or_default();

    let two_factor_cookie = cookies
        .to_str()
        .unwrap_or("")
        .split(';')
        .find(|cookie| cookie.trim().starts_with("twoFactorAuth="))
        .map(|cookie| cookie.trim().to_string())
        .unwrap_or_default();

    (auth_cookie, two_factor_cookie)
}

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
async fn command_new_auth(username: &str, password: &str) -> Result<String, String> {
    let jar = Arc::new(Jar::default());
    match get_new_auth_cookie_without_2fa(&jar, username, password).await? {
        AuthCookieOk::Success => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(serde_json::to_string(&CommandLoginOk {
                status: CommandLoginStatus::Success,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
            .map_err(|e| e.to_string())?)
        }
        AuthCookieOk::RequiresEmail2FA => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(serde_json::to_string(&CommandLoginOk {
                status: CommandLoginStatus::RequiresEmail2FA,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
            .map_err(|e| e.to_string())?)
        }
        AuthCookieOk::Requires2FA => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(serde_json::to_string(&CommandLoginOk {
                status: CommandLoginStatus::Requires2FA,
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
            .map_err(|e| e.to_string())?)
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

    match get_new_auth_cookie_without_2fa(&jar, username, password).await? {
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

    match get_new_auth_cookie_without_2fa(&jar, username, password).await? {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            command_fetch_avatars,
            command_new_auth,
            command_2fa,
            command_email_2fa
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
