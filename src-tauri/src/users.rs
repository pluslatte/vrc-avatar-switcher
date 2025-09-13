use vrchatapi::{
    apis::{authentication_api::get_current_user, configuration::Configuration},
    models::CurrentUser,
};

pub async fn fetch_user_data(config: &Configuration) -> Result<CurrentUser, String> {
    match get_current_user(config).await.map_err(|e| e.to_string())? {
        vrchatapi::models::EitherUserOrTwoFactor::CurrentUser(current_user) => Ok(current_user),
        vrchatapi::models::EitherUserOrTwoFactor::RequiresTwoFactorAuth(_) => {
            Err("You are not logged in.".to_string())
        }
    }
}
