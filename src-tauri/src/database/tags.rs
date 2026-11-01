use serde::Serialize;
use sqlx::{FromRow, SqlitePool};

use super::error::{tag_error, DatabaseError};

#[derive(Debug, PartialEq, Eq, Serialize, FromRow)]
pub struct Tag {
    pub display_name: String,
    pub color: String,
}

pub async fn create_tag(
    pool: &SqlitePool,
    tag_name: &str,
    current_user_id: &str,
    color: &str,
) -> Result<(), DatabaseError> {
    sqlx::query("INSERT INTO tags (display_name, color, created_by) VALUES (?, ?, ?)")
        .bind(tag_name)
        .bind(color)
        .bind(current_user_id)
        .execute(pool)
        .await
        .map_err(|error| tag_error(error, tag_name))?;
    Ok(())
}

pub async fn query_tag_exists(
    pool: &SqlitePool,
    tag_name: &str,
    current_user_id: &str,
) -> Result<bool, DatabaseError> {
    Ok(sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM tags WHERE display_name = ? AND created_by = ?)",
    )
    .bind(tag_name)
    .bind(current_user_id)
    .fetch_one(pool)
    .await?)
}

pub async fn query_all_tags_available(
    pool: &SqlitePool,
    current_user_id: &str,
) -> Result<Vec<Tag>, DatabaseError> {
    Ok(
        sqlx::query_as("SELECT display_name, color FROM tags WHERE created_by = ?")
            .bind(current_user_id)
            .fetch_all(pool)
            .await?,
    )
}

pub async fn drop_tag(
    pool: &SqlitePool,
    tag_name: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    sqlx::query("DELETE FROM tags WHERE display_name = ? AND created_by = ?")
        .bind(tag_name)
        .bind(current_user_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn update_tag(
    pool: &SqlitePool,
    old_tag_name: &str,
    new_tag_name: &str,
    new_color: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    sqlx::query(
        "UPDATE tags SET display_name = ?, color = ? WHERE display_name = ? AND created_by = ?",
    )
    .bind(new_tag_name)
    .bind(new_color)
    .bind(old_tag_name)
    .bind(current_user_id)
    .execute(pool)
    .await
    .map_err(|error| tag_error(error, new_tag_name))?;
    Ok(())
}
