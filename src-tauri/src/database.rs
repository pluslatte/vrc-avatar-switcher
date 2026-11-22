pub mod error;
pub mod settings;
pub mod tag_relations;
pub mod tags;

use std::path::Path;

use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};

pub async fn open(path: &Path) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    let pool = SqlitePool::connect_with(
        SqliteConnectOptions::new()
            .filename(path)
            .create_if_missing(true)
            .foreign_keys(true),
    )
    .await?;
    sqlx::migrate!().run(&pool).await?;
    Ok(pool)
}

#[cfg(test)]
mod tests;
