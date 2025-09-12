use std::{str::FromStr, sync::Arc};

use reqwest::cookie::{CookieStore, Jar};
use tauri::http::HeaderValue;
use vrchatapi::apis::configuration::Configuration;

pub fn create_configuration_from_raw_cookies(
    raw_auth_cookie: &str,
    raw_2fa_cookie: &str,
) -> Result<Configuration, String> {
    let jar = Arc::new(Jar::default());
    jar.set_cookies(
        &mut [
            HeaderValue::from_str(&format!("{raw_auth_cookie}; {raw_2fa_cookie}"))
                .map_err(|e| e.to_string())?,
        ]
        .iter(),
        &url::Url::from_str("https://api.vrchat.cloud").map_err(|e| e.to_string())?,
    );

    let config = Configuration {
        user_agent: Some("avatar-switcher/0.1.0".to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar)
            .build()
            .map_err(|e| e.to_string())?,
        ..Default::default()
    };

    Ok(config)
}

pub fn create_configuration(
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
