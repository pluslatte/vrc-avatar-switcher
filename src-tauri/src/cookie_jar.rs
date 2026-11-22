use reqwest::cookie::{CookieStore, Jar};

const VRCHAT_API_URL: &str = "https://api.vrchat.cloud";

pub fn restore_cookie_jar(raw_auth_cookie: &str, raw_2fa_cookie: &str) -> Jar {
    let jar = Jar::default();
    let url = url::Url::parse(VRCHAT_API_URL).expect("Invalid API URL");
    for cookie in [raw_auth_cookie, raw_2fa_cookie] {
        if !cookie.is_empty() {
            jar.add_cookie_str(cookie, &url);
        }
    }
    jar
}

fn find_cookie(cookies: &str, name: &str) -> String {
    cookies
        .split(';')
        .map(str::trim)
        .find(|cookie| cookie.starts_with(name))
        .map(str::to_string)
        .unwrap_or_default()
}

pub fn extract_cookies_from_jar(jar: &Jar) -> (String, String) {
    let header = jar.cookies(&url::Url::parse(VRCHAT_API_URL).expect("Invalid API URL"));
    let cookies = header
        .as_ref()
        .and_then(|value| value.to_str().ok())
        .unwrap_or("");

    (
        find_cookie(cookies, "auth="),
        find_cookie(cookies, "twoFactorAuth="),
    )
}

#[cfg(test)]
mod tests {
    use super::{extract_cookies_from_jar, restore_cookie_jar};

    #[test]
    fn restores_both_session_cookies() {
        let jar = restore_cookie_jar("auth=session", "twoFactorAuth=verified");
        assert_eq!(
            extract_cookies_from_jar(&jar),
            (
                "auth=session".to_string(),
                "twoFactorAuth=verified".to_string()
            )
        );
    }

    #[test]
    fn restores_session_without_two_factor_cookie() {
        let jar = restore_cookie_jar("auth=session", "");
        assert_eq!(
            extract_cookies_from_jar(&jar),
            ("auth=session".to_string(), String::new())
        );
    }

    #[test]
    fn restores_empty_session() {
        let jar = restore_cookie_jar("", "");
        assert_eq!(
            extract_cookies_from_jar(&jar),
            (String::new(), String::new())
        );
    }
}
