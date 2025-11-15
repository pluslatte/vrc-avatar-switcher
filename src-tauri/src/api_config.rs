use std::sync::Arc;

use reqwest::cookie::Jar;
use vrchatapi::apis::configuration::Configuration;

const USER_AGENT: &str = "vrc-avatar-switcher/0.4.1";

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
