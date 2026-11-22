use sqlx::SqlitePool;
use tauri::State;

use crate::database::{error::DatabaseError, settings};

#[tauri::command]
pub async fn command_query_client_config(
    pool: State<'_, SqlitePool>,
    key: &str,
) -> Result<String, DatabaseError> {
    settings::query_client_config(&pool, key).await
}

#[tauri::command]
pub async fn command_update_client_config(
    pool: State<'_, SqlitePool>,
    key: &str,
    value: &str,
) -> Result<(), DatabaseError> {
    settings::update_client_config(&pool, key, value).await
}
