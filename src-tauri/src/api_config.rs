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

use std::sync::Arc;

use reqwest::cookie::Jar;
use vrchatapi::apis::configuration::Configuration;

const USER_AGENT: &str = "vrc-avatar-switcher/0.4.3";

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
