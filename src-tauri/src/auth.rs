use std::sync::Arc;

use reqwest::cookie::{self, Jar};
use tauri::http::HeaderValue;
use vrchatapi::{
    apis::authentication_api::get_current_user,
    models::{EitherUserOrTwoFactor::CurrentUser, EitherUserOrTwoFactor::RequiresTwoFactorAuth},
};

use crate::config::create_configuration;

pub enum AuthCookieOk {
    Success {
        auth_cookie: String,
        two_fa_cookie: Option<String>,
    },
    RequiresEmail2FA {
        auth_cookie: String,
        two_fa_cookie: Option<String>,
    },
    Requires2FA {
        auth_cookie: String,
        two_fa_cookie: Option<String>,
    },
}
pub async fn get_new_auth_cookie_without_2fa(
    username: &str,
    password: &str,
) -> Result<AuthCookieOk, String> {
    let jar = Arc::new(Jar::default());
    let config = create_configuration(&jar, username, password)?;

    match get_current_user(&config).await.map_err(|e| e.to_string())? {
        CurrentUser(_) => {
            let extract = extract_cookies_from_jar(&jar);
            Ok(AuthCookieOk::Success {
                auth_cookie: extract.0,
                two_fa_cookie: Some(extract.1),
            })
        }
        RequiresTwoFactorAuth(auth_required) => {
            if auth_required
                .requires_two_factor_auth
                .contains(&String::from("emailOtp"))
            {
                let extract = extract_cookies_from_jar(&jar);
                Ok(AuthCookieOk::RequiresEmail2FA {
                    auth_cookie: extract.0,
                    two_fa_cookie: Some(extract.1),
                })
            } else {
                let extract = extract_cookies_from_jar(&jar);
                Ok(AuthCookieOk::Requires2FA {
                    auth_cookie: extract.0,
                    two_fa_cookie: Some(extract.1),
                })
            }
        }
    }
}

fn extract_cookies_from_jar<C>(jar: &Arc<C>) -> (String, String)
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
