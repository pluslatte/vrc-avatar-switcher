use std::collections::HashMap;

use sqlx::SqlitePool;
use tauri::State;

use crate::database::{error::DatabaseError, tag_relations, tags::Tag};

#[tauri::command]
pub async fn command_create_tag_relation(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    avatar_id: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    tag_relations::create_tag_relation(&pool, tag_name, avatar_id, current_user_id).await
}

#[tauri::command]
pub async fn command_count_tag_relations_of(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    current_user_id: &str,
) -> Result<i64, DatabaseError> {
    tag_relations::count_tag_relations_of(&pool, tag_name, current_user_id).await
}

#[tauri::command]
pub async fn command_drop_tag_relation(
    pool: State<'_, SqlitePool>,
    tag_name: &str,
    avatar_id: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    tag_relations::drop_tag_relation(&pool, tag_name, avatar_id, current_user_id).await
}

#[tauri::command]
pub async fn command_fetch_avatars_tags(
    pool: State<'_, SqlitePool>,
    avatar_ids: Vec<String>,
    current_user_id: &str,
) -> Result<HashMap<String, Vec<Tag>>, DatabaseError> {
    tag_relations::fetch_avatars_tags(&pool, &avatar_ids, current_user_id).await
}
