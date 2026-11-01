use sqlx::SqlitePool;

use super::error::DatabaseError;

pub async fn query_client_config(pool: &SqlitePool, key: &str) -> Result<String, DatabaseError> {
    let value: Option<String> =
        sqlx::query_scalar("SELECT value FROM client_settings WHERE key = ?")
            .bind(key)
            .fetch_optional(pool)
            .await?;
    Ok(value.unwrap_or_default())
}

pub async fn update_client_config(
    pool: &SqlitePool,
    key: &str,
    value: &str,
) -> Result<(), DatabaseError> {
    sqlx::query(
        "INSERT INTO client_settings (key, value) VALUES (?, ?) \
         ON CONFLICT (key) DO UPDATE SET value = excluded.value",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await?;
    Ok(())
}
