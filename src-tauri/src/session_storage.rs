use std::{fs, path::PathBuf};

use reqwest::cookie::Jar;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::cookie_jar::extract_cookies_from_jar;

const SESSION_FILE: &str = "session.json";

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct StoredSession {
    pub auth_cookie: String,
    pub two_fa_cookie: String,
}

pub fn persist_session(app: &AppHandle, jar: &Jar) -> Result<(), String> {
    let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(jar);
    let stored = StoredSession {
        auth_cookie,
        two_fa_cookie,
    };
    let directory = session_directory(app)?;
    fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let path = directory.join(SESSION_FILE);
    let json = serde_json::to_string(&stored).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}

pub fn delete_session(app: &AppHandle) -> Result<(), String> {
    let path = session_file_path(app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn session_directory(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_config_dir().map_err(|e| e.to_string())
}

fn session_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(session_directory(app)?.join(SESSION_FILE))
}

pub fn load_stored_session(app: &AppHandle) -> Result<StoredSession, String> {
    let path = session_file_path(app)?;
    if !path.exists() {
        return Ok(StoredSession::default());
    }
    let json = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(serde_json::from_str(&json).unwrap_or_default())
}
