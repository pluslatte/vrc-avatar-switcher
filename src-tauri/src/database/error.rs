use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum DatabaseError {
    DuplicateTag(String),
    Database(String),
}

impl From<sqlx::Error> for DatabaseError {
    fn from(error: sqlx::Error) -> Self {
        Self::Database(error.to_string())
    }
}

pub fn tag_error(error: sqlx::Error, tag_name: &str) -> DatabaseError {
    match error {
        sqlx::Error::Database(error) if error.is_unique_violation() => {
            DatabaseError::DuplicateTag(tag_name.to_owned())
        }
        error => error.into(),
    }
}
