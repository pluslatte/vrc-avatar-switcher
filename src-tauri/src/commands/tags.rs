use sqlx::SqlitePool;
use tauri::State;

use crate::database::{
    error::DatabaseError,
    tags::{self, Tag},
};

#[tauri::command]
pub async fn command_create_tag(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    current_user_id: &str,
    color: &str,
) -> Result<(), DatabaseError> {
    tags::create_tag(&pool, tag_name, current_user_id, color).await
}

#[tauri::command]
pub async fn command_query_tag_exists(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    current_user_id: &str,
) -> Result<bool, DatabaseError> {
    tags::query_tag_exists(&pool, tag_name, current_user_id).await
}

#[tauri::command]
pub async fn command_query_all_tags_available(
    pool: State<'_, SqlitePool>,
    current_user_id: &str,
) -> Result<Vec<Tag>, DatabaseError> {
    tags::query_all_tags_available(&pool, current_user_id).await
}

#[tauri::command]
pub async fn command_drop_tag(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    tags::drop_tag(&pool, tag_name, current_user_id).await
}

#[tauri::command]
pub async fn command_update_tag(
    pool: State<'_, SqlitePool>,
    old_tag_name: &str,
    new_tag_name: &str,
    new_color: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    tags::update_tag(
        &pool,
        old_tag_name,
        new_tag_name,
        new_color,
        current_user_id,
    )
    .await
}
