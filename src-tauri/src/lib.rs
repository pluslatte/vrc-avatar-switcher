mod auth;
mod avatars;
mod config;

use vrchatapi::models::Avatar;

use crate::{avatars::fetch_avatars, config::create_configuration_from_raw_cookies};

#[tauri::command]
async fn command_fetch_avatars(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<Vec<Avatar>, String> {
    let config = create_configuration_from_raw_cookies(raw_auth_cookie, raw_2fa_cookie)?;
    fetch_avatars(&config).await
}

// #[tauri::command]
// async fn command_login(username: &str, password: &str) -> Result<, String> {

// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![command_fetch_avatars])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
