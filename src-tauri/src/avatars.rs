use std::time::Duration;

use vrchatapi::{
    apis::configuration::Configuration,
    models::{Avatar, CurrentUser, OrderOption, SortOption},
};

pub async fn fetch_avatars(
    config: &Configuration,
    sort_option: SortOption,
) -> Result<Vec<Avatar>, String> {
    let mut out: Vec<Avatar> = Vec::new();

    loop {
        let offset = i32::try_from(out.len()).map_err(|e| e.to_string())?;
        let page = vrchatapi::apis::avatars_api::search_avatars(
            config,
            Some(false),
            Some(sort_option),
            Some("me"),
            None,
            Some(60),
            if sort_option == SortOption::Updated {
                Some(OrderOption::Descending)
            } else {
                Some(OrderOption::Ascending)
            },
            Some(offset),
            None,
            None,
            Some(vrchatapi::models::ReleaseStatus::All),
            None,
            None,
            None,
            None,
        )
        .await
        .map_err(|e| format!("Error fetching avatars: {e}"))?;

        if page.is_empty() {
            return Ok(out);
        }
        out.extend(page);

        // To avoid hitting rate limits
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}

pub async fn switch_avatar(config: &Configuration, avatar_id: &str) -> Result<CurrentUser, String> {
    vrchatapi::apis::avatars_api::select_avatar(config, avatar_id)
        .await
        .map_err(|e| format!("Error switching avatar: {e}"))
}
