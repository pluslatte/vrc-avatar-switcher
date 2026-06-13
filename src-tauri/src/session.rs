use std::{fs, path::PathBuf, sync::Arc};

use reqwest::cookie::Jar;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

use crate::cookie_jar::{extract_cookies_from_jar, set_raw_cookies_into_jar};

const SESSION_FILE: &str = "session.json";

#[derive(Debug, Default, Serialize, Deserialize)]
struct StoredSession {
    auth_cookie: String,
    two_fa_cookie: String,
}

#[derive(Default)]
pub struct SessionState {
    jar: Mutex<Option<Arc<Jar>>>,
}

impl SessionState {
    pub async fn jar(&self, app: &AppHandle) -> Result<Arc<Jar>, String> {
        let mut guard = self.jar.lock().await;
        if let Some(jar) = guard.as_ref() {
            return Ok(jar.clone());
        }
        let stored = load_stored_session(app)?;
        let jar = Arc::new(Jar::default());
        if !stored.auth_cookie.is_empty() {
            set_raw_cookies_into_jar(&jar, &stored.auth_cookie, &stored.two_fa_cookie)?;
        }
        *guard = Some(jar.clone());
        Ok(jar)
    }

    pub async fn replace_jar(&self, jar: Arc<Jar>) {
        *self.jar.lock().await = Some(jar);
    }

    pub async fn clear(&self) {
        *self.jar.lock().await = None;
    }
}

pub fn has_auth_cookie(jar: &Arc<Jar>) -> bool {
    let (auth_cookie, _) = extract_cookies_from_jar(jar);
    !auth_cookie.is_empty()
}

pub fn persist_session(app: &AppHandle, jar: &Arc<Jar>) -> Result<(), String> {
    let (auth_cookie, two_fa_cookie) = extract_cookies_from_jar(jar);
    let stored = StoredSession {
        auth_cookie,
        two_fa_cookie,
    };
    let path = session_file_path(app)?;
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
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

fn session_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join(SESSION_FILE))
}

fn load_stored_session(app: &AppHandle) -> Result<StoredSession, String> {
    let path = session_file_path(app)?;
    if !path.exists() {
        return Ok(StoredSession::default());
    }
    let json = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(serde_json::from_str(&json).unwrap_or_default())
}
