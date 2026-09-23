use std::sync::Arc;

use reqwest::cookie::Jar;
use vrchatapi::apis::configuration::Configuration;

const USER_AGENT: &str = concat!("vrc-avatar-switcher/", env!("CARGO_PKG_VERSION"));

pub fn create_configuration_for_login(
    jar: &Arc<Jar>,
    username: &str,
    password: &str,
) -> Result<Configuration, String> {
    let mut config = create_configuration(jar)?;
    config.basic_auth = Some((username.to_string(), Some(password.to_string())));
    Ok(config)
}

pub fn create_configuration(jar: &Arc<Jar>) -> Result<Configuration, String> {
    let client = reqwest::Client::builder()
        .cookie_provider(jar.clone())
        .build()
        .map_err(|e| e.to_string())?;
    let mut config = Configuration::new();
    config.user_agent = Some(USER_AGENT.to_string());
    config.client = reqwest_middleware::ClientBuilder::new(client).build();
    Ok(config)
}
