use tauri::{AppHandle, State};
use vrchatapi::models::CurrentUser;

use crate::{api_config::create_configuration, session::SessionState, users};

#[tauri::command]
pub async fn command_fetch_current_user(
    app: AppHandle,
    session: State<'_, SessionState>,
) -> Result<CurrentUser, String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;
    users::fetch_user_data(&config).await
}
