use std::{str::FromStr, sync::Arc, thread::sleep, time::Duration};

use reqwest::cookie::CookieStore;
use tauri::http::HeaderValue;
use vrchatapi::{
    apis::{self, configuration::Configuration},
    models::Avatar,
};

#[tauri::command]
async fn fetch_avatars(raw_auth_cookie: &str, raw_2fa_cookie: &str) -> Result<Vec<Avatar>, String> {
    let mut out = Vec::new();
    let mut avatar_count: usize = 0;

    let jar = Arc::new(reqwest::cookie::Jar::default());
    jar.set_cookies(
        &mut [
            HeaderValue::from_str(&format!("{raw_auth_cookie}; {raw_2fa_cookie}"))
                .expect("Invalid cookie string"),
        ]
        .iter(),
        &url::Url::from_str("https://api.vrchat.cloud").expect("Invalid URL"),
    );
    let config = Configuration {
        user_agent: Some("avatar-switcher/0.1.0".to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar)
            .build()
            .expect("Failed to build reqwest client"),
        ..Default::default()
    };

    loop {
        let avatars = apis::avatars_api::search_avatars(
            &config,
            Some(false),
            Some(vrchatapi::models::SortOption::Name),
            Some("me"),
            None,
            Some(60),
            None,
            Some(avatar_count.try_into().expect("Negative avatar count wtf")),
            None,
            None,
            Some(vrchatapi::models::ReleaseStatus::All),
            None,
            None,
            None,
        )
        .await;

        match avatars {
            Ok(avatars) => {
                if avatars.is_empty() {
                    return Ok(out);
                }

                avatar_count += avatars.len();
                avatars.iter().for_each(|avatar| {
                    println!("Fetched: {}", avatar.name);
                    out.push(avatar.clone());
                });

                sleep(Duration::from_millis(1000)); // To avoid rate limiting
            }
            Err(e) => {
                return Err(e.to_string());
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![fetch_avatars])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
