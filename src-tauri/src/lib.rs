mod api_config;
mod auth;
mod avatars;
mod commands;
mod cookie_jar;
mod database;
mod models;
mod session;
mod session_storage;
mod users;

use crate::commands::{
    command_2fa, command_check_auth, command_email_2fa, command_fetch_avatars,
    command_fetch_current_user, command_logout, command_new_auth, command_switch_avatar,
};
use crate::session::SessionState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let directory = app.path().app_config_dir()?;
            std::fs::create_dir_all(&directory)?;
            let pool = tauri::async_runtime::block_on(database::open(
                &directory.join("vrc-avatar-switcher.db"),
            ))?;
            app.manage(pool);
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .manage(SessionState::default())
        .invoke_handler(tauri::generate_handler![
            command_fetch_avatars,
            command_new_auth,
            command_2fa,
            command_email_2fa,
            command_check_auth,
            command_fetch_current_user,
            command_switch_avatar,
            command_logout,
            commands::tags::command_create_tag,
            commands::tags::command_query_tag_exists,
            commands::tags::command_query_all_tags_available,
            commands::tags::command_drop_tag,
            commands::tags::command_update_tag,
            commands::tag_relations::command_create_tag_relation,
            commands::tag_relations::command_count_tag_relations_of,
            commands::tag_relations::command_drop_tag_relation,
            commands::tag_relations::command_fetch_avatars_tags,
            commands::settings::command_query_client_config,
            commands::settings::command_update_client_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
