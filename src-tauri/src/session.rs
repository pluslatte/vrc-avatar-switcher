use std::sync::Arc;

use reqwest::cookie::Jar;
use tauri::AppHandle;
use tokio::sync::Mutex;

use crate::{
    cookie_jar::{extract_cookies_from_jar, restore_cookie_jar},
    session_storage::load_stored_session,
};

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
        let jar = Arc::new(restore_cookie_jar(
            &stored.auth_cookie,
            &stored.two_fa_cookie,
        ));
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
