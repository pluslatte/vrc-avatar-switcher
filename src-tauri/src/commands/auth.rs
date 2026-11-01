use std::sync::Arc;

use reqwest::cookie::Jar;
use tauri::{AppHandle, State};
use vrchatapi::{
    apis::authentication_api::{verify2_fa, verify2_fa_email_code},
    models::{TwoFactorAuthCode, TwoFactorEmailCode},
};

use crate::{
    api_config::{create_configuration, create_configuration_for_login},
    auth::{is_auth_cookie_valid, try_login_without_2fa},
    models::{CommandAuthState, LoginStatus},
    session::{has_auth_cookie, SessionState},
    session_storage::{delete_session, persist_session},
};

async fn finish_2fa_login(jar: &Arc<Jar>, username: &str, password: &str) -> Result<(), String> {
    let config = create_configuration_for_login(jar, username, password)?;
    match try_login_without_2fa(&config).await? {
        LoginStatus::Success => Ok(()),
        _ => Err("2FA verification failed.".to_string()),
    }
}

#[tauri::command]
pub async fn command_new_auth(
    app: AppHandle,
    session: State<'_, SessionState>,
    username: &str,
    password: &str,
) -> Result<LoginStatus, String> {
    let jar = Arc::new(Jar::default());
    let config = create_configuration_for_login(&jar, username, password)?;

    let status = try_login_without_2fa(&config).await?;

    session.replace_jar(jar.clone()).await;
    if matches!(status, LoginStatus::Success) {
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
) -> Result<CommandAuthState, String> {
    let jar = session.jar(&app).await?;
    if !has_auth_cookie(&jar) {
        return Ok(CommandAuthState::LoggedOut);
    }
    let config = create_configuration(&jar)?;
    match is_auth_cookie_valid(&config).await {
        Ok(true) => Ok(CommandAuthState::Authenticated),
        Ok(false) | Err(_) => Ok(CommandAuthState::NeedsReauth),
    }
}

#[tauri::command]
pub async fn command_logout(
    app: AppHandle,
    session: State<'_, SessionState>,
) -> Result<(), String> {
    session.clear().await;
    delete_session(&app)
}
