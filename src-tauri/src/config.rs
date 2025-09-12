use std::{str::FromStr, sync::Arc};

use reqwest::cookie::{CookieStore, Jar};
use tauri::http::HeaderValue;
use vrchatapi::apis::configuration::Configuration;

pub fn set_raw_cookies_into_jar(
    jar: &Arc<Jar>,
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<(), String> {
    jar.set_cookies(
        &mut [
            HeaderValue::from_str(&format!("{raw_auth_cookie}; {raw_2fa_cookie}"))
                .map_err(|e| e.to_string())?,
        ]
        .iter(),
        &url::Url::from_str("https://api.vrchat.cloud").map_err(|e| e.to_string())?,
    );
    Ok(())
}

pub fn create_configuration_for_login(
    jar: &Arc<Jar>,
    username: &str,
    password: &str,
) -> Result<Configuration, String> {
    Ok(Configuration {
        basic_auth: Some((username.to_string(), Some(password.to_string()))),
        user_agent: Some("avatar-switcher/0.1.0".to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar.clone())
            .build()
            .map_err(|e| e.to_string())?,
        ..Default::default()
    })
}

pub fn create_configuration(jar: &Arc<Jar>) -> Result<Configuration, String> {
    Ok(Configuration {
        user_agent: Some("avatar-switcher/0.1.0".to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar.clone())
            .build()
            .map_err(|e| e.to_string())?,
        ..Default::default()
    })
}
