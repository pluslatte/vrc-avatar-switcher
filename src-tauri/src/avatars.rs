/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use std::{thread::sleep, time::Duration};

use vrchatapi::{
    apis::configuration::Configuration,
    models::{Avatar, CurrentUser, OrderOption, SortOption},
};

pub async fn fetch_avatars(
    config: &Configuration,
    sort_option: SortOption,
) -> Result<Vec<Avatar>, String> {
    let mut out = Vec::new();
    let mut avatar_count: usize = 0;

    loop {
        let avatars = vrchatapi::apis::avatars_api::search_avatars(
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
                    out.push(avatar.clone());
                });

                // To avoid hitting rate limits
                sleep(Duration::from_millis(100));
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
