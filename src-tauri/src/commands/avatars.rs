use tauri::{AppHandle, State};
use vrchatapi::models::{Avatar, CurrentUser, SortOption};

use crate::{
    api_config::create_configuration, avatars, models::AvatarSortOption, session::SessionState,
};

#[tauri::command]
pub async fn command_fetch_avatars(
    app: AppHandle,
    session: State<'_, SessionState>,
    sort_option: AvatarSortOption,
) -> Result<Vec<Avatar>, String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;

    let sort_option = match sort_option {
        AvatarSortOption::Name => SortOption::Name,
        AvatarSortOption::Updated => vrchatapi::models::SortOption::Updated,
    };

    avatars::fetch_avatars(&config, sort_option).await
}

#[tauri::command]
pub async fn command_switch_avatar(
    app: AppHandle,
    session: State<'_, SessionState>,
    avatar_id: &str,
) -> Result<CurrentUser, String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;
    avatars::switch_avatar(&config, avatar_id).await
}
