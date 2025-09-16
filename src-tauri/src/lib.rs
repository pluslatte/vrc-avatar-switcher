mod api_config;
mod auth;
mod avatars;
mod commands;
mod cookie_jar;
mod migrations;
mod models;
mod users;

use crate::commands::{
    command_2fa, command_check_auth, command_email_2fa, command_fetch_avatars,
    command_fetch_current_user, command_new_auth, command_switch_avatar,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:vrc-avatar-switcher.db", migrations::migrations())
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            command_fetch_avatars,
            command_new_auth,
            command_2fa,
            command_email_2fa,
            command_check_auth,
            command_fetch_current_user,
            command_switch_avatar
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
