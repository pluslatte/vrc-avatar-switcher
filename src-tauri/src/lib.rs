mod auth;
mod avatars;
mod config;

use serde::{Deserialize, Serialize};
use vrchatapi::models::Avatar;

use crate::{
    auth::{get_new_auth_cookie_without_2fa, AuthCookieOk},
    avatars::fetch_avatars,
    config::create_configuration_from_raw_cookies,
};

#[tauri::command]
async fn command_fetch_avatars(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<Vec<Avatar>, String> {
    let config = create_configuration_from_raw_cookies(raw_auth_cookie, raw_2fa_cookie)?;
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
    match get_new_auth_cookie_without_2fa(username, password).await? {
        AuthCookieOk::Success {
            auth_cookie,
            two_fa_cookie,
        } => Ok(serde_json::to_string(&CommandLoginOk {
            status: CommandLoginStatus::Success,
            auth_cookie,
            two_fa_cookie,
        })
        .map_err(|e| e.to_string())?),
        AuthCookieOk::RequiresEmail2FA {
            auth_cookie,
            two_fa_cookie,
        } => Ok(serde_json::to_string(&CommandLoginOk {
            status: CommandLoginStatus::RequiresEmail2FA,
            auth_cookie,
            two_fa_cookie,
        })
        .map_err(|e| e.to_string())?),
        AuthCookieOk::Requires2FA {
            auth_cookie,
            two_fa_cookie,
        } => Ok(serde_json::to_string(&CommandLoginOk {
            status: CommandLoginStatus::Requires2FA,
            auth_cookie,
            two_fa_cookie,
        })
        .map_err(|e| e.to_string())?),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            command_fetch_avatars,
            command_new_auth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
