use std::{str::FromStr, sync::Arc};

use reqwest::cookie::{CookieStore, Jar};
use tauri::http::HeaderValue;
use vrchatapi::apis::configuration::Configuration;

pub fn create_configuration(
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
