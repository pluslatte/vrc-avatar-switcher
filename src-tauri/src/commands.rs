use std::sync::Arc;

use reqwest::cookie::Jar;
use tauri::{AppHandle, State};
use vrchatapi::{
    apis::authentication_api::{verify2_fa, verify2_fa_email_code},
    models::{Avatar, CurrentUser, TwoFactorAuthCode, TwoFactorEmailCode},
};

use crate::{
    api_config::{create_configuration, create_configuration_for_login},
    auth::{is_auth_cookie_valid, try_login_without_2fa, AuthCookieOk},
    avatars::{self, fetch_avatars},
    models::{AvatarSortOption, CommandLoginStatus},
    session::{delete_session, has_auth_cookie, persist_session, SessionState},
    users,
};

async fn finish_2fa_login(jar: &Arc<Jar>, username: &str, password: &str) -> Result<(), String> {
    let config = create_configuration_for_login(jar, username, password)?;
    match try_login_without_2fa(&config).await? {
        AuthCookieOk::Success => Ok(()),
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
pub async fn command_fetch_avatars(
    app: AppHandle,
    session: State<'_, SessionState>,
    sort_option: AvatarSortOption,
) -> Result<Vec<Avatar>, String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;

    let sort_option = match sort_option {
        AvatarSortOption::Name => vrchatapi::models::SortOption::Name,
        AvatarSortOption::Updated => vrchatapi::models::SortOption::Updated,
    };

    fetch_avatars(&config, sort_option).await
}

#[tauri::command]
pub async fn command_new_auth(
    app: AppHandle,
    session: State<'_, SessionState>,
    username: &str,
    password: &str,
) -> Result<CommandLoginStatus, String> {
    let jar = Arc::new(Jar::default());
    let config = create_configuration_for_login(&jar, username, password)?;

    let status = match try_login_without_2fa(&config).await? {
        AuthCookieOk::Success => CommandLoginStatus::Success,
        AuthCookieOk::Requires2FA => CommandLoginStatus::Requires2FA,
        AuthCookieOk::RequiresEmail2FA => CommandLoginStatus::RequiresEmail2FA,
    };

    session.replace_jar(jar.clone()).await;
    if matches!(status, CommandLoginStatus::Success) {
        persist_session(&app, &jar)?;
    }
    Ok(status)
}

#[tauri::command]
pub async fn command_2fa(
    app: AppHandle,
    session: State<'_, SessionState>,
    username: &str,
    password: &str,
    two_fa_code: &str,
) -> Result<(), String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;

    verify2_fa(&config, TwoFactorAuthCode::new(two_fa_code.to_string()))
        .await
        .map_err(|e| e.to_string())?;

    finish_2fa_login(&jar, username, password).await?;
    persist_session(&app, &jar)?;
    Ok(())
}

#[tauri::command]
pub async fn command_email_2fa(
    app: AppHandle,
    session: State<'_, SessionState>,
    username: &str,
    password: &str,
    two_fa_code: &str,
) -> Result<(), String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;

    verify2_fa_email_code(&config, TwoFactorEmailCode::new(two_fa_code.to_string()))
        .await
        .map_err(|e| e.to_string())?;

    finish_2fa_login(&jar, username, password).await?;
    persist_session(&app, &jar)?;
    Ok(())
}

#[tauri::command]
pub async fn command_check_auth(
    app: AppHandle,
    session: State<'_, SessionState>,
) -> Result<bool, String> {
    let jar = session.jar(&app).await?;
    if !has_auth_cookie(&jar) {
        return Ok(false);
    }
    let config = create_configuration(&jar)?;
    is_auth_cookie_valid(&config).await
}

#[tauri::command]
pub async fn command_fetch_current_user(
    app: AppHandle,
    session: State<'_, SessionState>,
) -> Result<CurrentUser, String> {
    let jar = session.jar(&app).await?;
    let config = create_configuration(&jar)?;
    users::fetch_user_data(&config).await
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

#[tauri::command]
pub async fn command_logout(
    app: AppHandle,
    session: State<'_, SessionState>,
) -> Result<(), String> {
    session.clear().await;
    delete_session(&app)
}
