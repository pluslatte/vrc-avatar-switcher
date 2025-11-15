/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>.
*/

use std::sync::Arc;

use reqwest::cookie::Jar;
use vrchatapi::apis::configuration::Configuration;

const USER_AGENT: &str = "vrc-avatar-switcher/0.4.2";

pub fn create_configuration_for_login(
    jar: &Arc<Jar>,
    username: &str,
    password: &str,
) -> Result<Configuration, String> {
    Ok(Configuration {
        basic_auth: Some((username.to_string(), Some(password.to_string()))),
        user_agent: Some(USER_AGENT.to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar.clone())
            .build()
            .map_err(|e| e.to_string())?,
        ..Default::default()
    })
}

pub fn create_configuration(jar: &Arc<Jar>) -> Result<Configuration, String> {
    Ok(Configuration {
        user_agent: Some(USER_AGENT.to_string()),
        client: reqwest::Client::builder()
            .cookie_provider(jar.clone())
            .build()
            .map_err(|e| e.to_string())?,
        ..Default::default()
    })
}
