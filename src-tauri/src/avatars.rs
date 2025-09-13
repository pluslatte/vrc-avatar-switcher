use std::{thread::sleep, time::Duration};

use vrchatapi::{
    apis::configuration::Configuration,
    models::{Avatar, CurrentUser},
};

pub async fn fetch_avatars(config: &Configuration) -> Result<Vec<Avatar>, String> {
    let mut out = Vec::new();
    let mut avatar_count: usize = 0;

    loop {
        let avatars = vrchatapi::apis::avatars_api::search_avatars(
            config,
            Some(false),
            Some(vrchatapi::models::SortOption::Name),
            Some("me"),
            None,
            Some(60),
            None,
            Some(avatar_count.try_into().expect("Negative avatar count???")),
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

                // To avoid hitting rate limits
                sleep(Duration::from_millis(1000));
            }
            Err(e) => {
                return Err(format!("Error fetching avatars: {e}"));
            }
        }
    }
}

pub async fn switch_avatar(config: &Configuration, avatar_id: &str) -> Result<CurrentUser, String> {
    match vrchatapi::apis::avatars_api::select_avatar(config, avatar_id).await {
        Ok(current_user) => Ok(current_user),
        Err(e) => Err(format!("Error switching avatar: {e}")),
    }
}
