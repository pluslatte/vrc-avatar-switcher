use std::collections::HashMap;

use sqlx::{QueryBuilder, Sqlite, SqlitePool};

use super::{error::DatabaseError, tags::Tag};

pub async fn create_tag_relation(
    pool: &SqlitePool,
    tag_name: &str,
    avatar_id: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    sqlx::query(
        "INSERT OR IGNORE INTO tag_avatar_relations (tag_display_name, avatar_id, created_by) \
         VALUES (?, ?, ?)",
    )
    .bind(tag_name)
    .bind(avatar_id)
    .bind(current_user_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn count_tag_relations_of(
    pool: &SqlitePool,
    tag_name: &str,
    current_user_id: &str,
) -> Result<i64, DatabaseError> {
    Ok(sqlx::query_scalar(
        "SELECT COUNT(*) FROM tag_avatar_relations WHERE tag_display_name = ? AND created_by = ?",
    )
    .bind(tag_name)
    .bind(current_user_id)
    .fetch_one(pool)
    .await?)
}

pub async fn drop_tag_relation(
    pool: &SqlitePool,
    tag_name: &str,
    avatar_id: &str,
    current_user_id: &str,
) -> Result<(), DatabaseError> {
    sqlx::query(
        "DELETE FROM tag_avatar_relations \
         WHERE tag_display_name = ? AND avatar_id = ? AND created_by = ?",
    )
    .bind(tag_name)
    .bind(avatar_id)
    .bind(current_user_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn fetch_avatars_tags(
    pool: &SqlitePool,
    avatar_ids: &[String],
    current_user_id: &str,
) -> Result<HashMap<String, Vec<Tag>>, DatabaseError> {
    if avatar_ids.is_empty() {
        return Ok(HashMap::new());
    }
    let mut query = QueryBuilder::<Sqlite>::new(
        "SELECT tar.avatar_id, t.display_name, t.color FROM tag_avatar_relations AS tar \
         JOIN tags AS t ON tar.tag_display_name = t.display_name AND tar.created_by = t.created_by \
         WHERE tar.created_by = ",
    );
    query
        .push_bind(current_user_id)
        .push(" AND tar.avatar_id IN (");
    let mut ids = query.separated(", ");
    for id in avatar_ids {
        ids.push_bind(id);
    }
    query.push(")");
    let rows: Vec<(String, String, String)> = query.build_query_as().fetch_all(pool).await?;
    let mut tags: HashMap<String, Vec<Tag>> = HashMap::new();
    for (avatar_id, display_name, color) in rows {
        tags.entry(avatar_id).or_default().push(Tag {
            display_name,
            color,
        });
    }
    Ok(tags)
}
