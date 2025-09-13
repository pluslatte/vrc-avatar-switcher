use std::{str::FromStr, sync::Arc};

use reqwest::cookie::{self, CookieStore, Jar};
use tauri::http::HeaderValue;

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

pub fn extract_cookies_from_jar<C>(jar: &Arc<C>) -> (String, String)
where
    C: cookie::CookieStore + 'static,
{
    let cookies = jar
        .cookies(&url::Url::parse("https://api.vrchat.cloud").expect("Invalid URL"))
        .unwrap_or(HeaderValue::from_str("").unwrap());

    let auth_cookie = cookies
        .to_str()
        .unwrap_or("")
        .split(';')
        .find(|cookie| cookie.trim().starts_with("auth="))
        .map(|cookie| cookie.trim().to_string())
        .unwrap_or_default();

    let two_factor_cookie = cookies
        .to_str()
        .unwrap_or("")
        .split(';')
        .find(|cookie| cookie.trim().starts_with("twoFactorAuth="))
        .map(|cookie| cookie.trim().to_string())
        .unwrap_or_default();

    (auth_cookie, two_factor_cookie)
}
