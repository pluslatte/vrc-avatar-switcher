use vrchatapi::{
    apis::{authentication_api::get_current_user, configuration::Configuration},
    models::{CurrentUser, RegisterUserAccount200Response},
};

pub async fn fetch_user_data(config: &Configuration) -> Result<CurrentUser, String> {
    match get_current_user(config).await.map_err(|e| e.to_string())? {
        RegisterUserAccount200Response::CurrentUser(current_user) => Ok(current_user),
        RegisterUserAccount200Response::RequiresTwoFactorAuth(_) => {
            Err("You are not logged in.".to_string())
        }
    }
}
