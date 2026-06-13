use std::{str::FromStr, sync::Arc};

use reqwest::cookie::{self, CookieStore, Jar};
use tauri::http::HeaderValue;

pub const VRCHAT_API_URL: &str = "https://api.vrchat.cloud";

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
        &url::Url::from_str(VRCHAT_API_URL).map_err(|e| e.to_string())?,
    );
    Ok(())
}

fn find_cookie(cookies: &str, name: &str) -> String {
    cookies
        .split(';')
        .map(str::trim)
        .find(|cookie| cookie.starts_with(name))
        .map(str::to_string)
        .unwrap_or_default()
}

pub fn extract_cookies_from_jar<C>(jar: &Arc<C>) -> (String, String)
where
    C: cookie::CookieStore + 'static,
{
    let header = jar.cookies(&url::Url::parse(VRCHAT_API_URL).expect("Invalid URL"));
    let cookies = header
        .as_ref()
        .and_then(|value| value.to_str().ok())
        .unwrap_or("");

    (
        find_cookie(cookies, "auth="),
        find_cookie(cookies, "twoFactorAuth="),
    )
}
