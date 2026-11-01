use sqlx::{migrate::Migrate, sqlite::SqlitePoolOptions, Connection, SqliteConnection, SqlitePool};

use super::{error::DatabaseError, settings::*, tag_relations::*, tags::*};

#[test]
fn migration_checksums_match_the_previous_sql_plugin() {
    let checksums = [
        "df7e50635ce5826a479ca9893244fc8bb9d714443f2ecc2491d8c5a5897f740459a572b51201e5884dac0f18ae4bb0ac",
        "6c148290654414ce0bd040380fa3ef6a51737665d26e366992950734a98e9f96c17136d4ecefd13b8bf21c16acb3bae0",
        "1a6a17c01002c49fc690ee12131aebefae39aa4669d5f82b48e06d75f8ff26e3521f9116507ba9fb26900311eadb0ec0",
        "d3765fa39fcf0d8b5c029865ec6c87e5635539ac648af473373efb4bd3fd3cfe3bccf48202a2d1d1d756e78fdad7d076",
    ];
    let migrator = sqlx::migrate!();
    assert_eq!(migrator.iter().count(), checksums.len());
    for (migration, expected) in migrator.iter().zip(checksums) {
        let actual: String = migration
            .checksum
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect();
        assert_eq!(actual, expected, "migration {}", migration.version);
    }
}

#[tokio::test]
async fn reopening_the_database_preserves_data_and_foreign_keys() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("vrc-avatar-switcher.db");
    let pool = super::open(&path).await.unwrap();
    create_tag(&pool, "Saved", "user_a", "red").await.unwrap();
    create_tag_relation(&pool, "Saved", "avatar_1", "user_a")
        .await
        .unwrap();
    update_client_config(&pool, "key", "value").await.unwrap();
    pool.close().await;
    let pool = super::open(&path).await.unwrap();
    assert_eq!(query_client_config(&pool, "key").await.unwrap(), "value");
    assert_eq!(
        count_tag_relations_of(&pool, "Saved", "user_a")
            .await
            .unwrap(),
        1
    );
    update_tag(&pool, "Saved", "Renamed", "blue", "user_a")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Renamed", "user_a")
            .await
            .unwrap(),
        1
    );
    drop_tag(&pool, "Renamed", "user_a").await.unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Renamed", "user_a")
            .await
            .unwrap(),
        0
    );
    pool.close().await;
}

async fn test_pool() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .unwrap();
    sqlx::migrate!().run(&pool).await.unwrap();
    pool
}

#[tokio::test]
async fn upgrading_a_previous_database_preserves_tags_assignments_and_settings() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("vrc-avatar-switcher.db");
    let mut connection = SqliteConnection::connect_with(
        &sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&path)
            .create_if_missing(true),
    )
    .await
    .unwrap();
    connection.ensure_migrations_table().await.unwrap();
    for migration in sqlx::migrate!().iter().take(3) {
        connection.apply(migration).await.unwrap();
    }
    sqlx::raw_sql(
        "INSERT INTO tags (display_name, color, created_by) VALUES ('Saved', 'red', 'user_a');
         INSERT INTO tag_avatar_relations (tag_display_name, avatar_id, created_by)
         VALUES ('Saved', 'avatar_1', 'user_a');
         INSERT INTO client_settings (key, value) VALUES ('key', 'value');",
    )
    .execute(&mut connection)
    .await
    .unwrap();
    connection.close().await.unwrap();

    let pool = super::open(&path).await.unwrap();
    assert_eq!(query_client_config(&pool, "key").await.unwrap(), "value");
    let ids = vec!["avatar_1".into()];
    assert_eq!(
        fetch_avatars_tags(&pool, &ids, "user_a").await.unwrap()["avatar_1"],
        vec![Tag {
            display_name: "Saved".into(),
            color: "red".into()
        }]
    );
    update_tag(&pool, "Saved", "Renamed", "blue", "user_a")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Renamed", "user_a")
            .await
            .unwrap(),
        1
    );
    pool.close().await;
}

#[tokio::test]
async fn tags_are_scoped_to_their_creator() {
    let pool = test_pool().await;
    create_tag(&pool, "Cute", "user_a", "red").await.unwrap();
    assert!(!query_tag_exists(&pool, "Cute", "user_b").await.unwrap());
    create_tag(&pool, "Cute", "user_b", "blue").await.unwrap();
    assert_eq!(
        query_all_tags_available(&pool, "user_a").await.unwrap(),
        vec![Tag {
            display_name: "Cute".into(),
            color: "red".into()
        }]
    );
    assert!(matches!(
        create_tag(&pool, "Cute", "user_a", "green").await,
        Err(DatabaseError::DuplicateTag(name)) if name == "Cute"
    ));
}

#[tokio::test]
async fn renaming_and_deleting_cascade_only_for_the_creator() {
    let pool = test_pool().await;
    for user in ["user_a", "user_b"] {
        create_tag(&pool, "Old", user, "red").await.unwrap();
        create_tag_relation(&pool, "Old", "avatar_1", user)
            .await
            .unwrap();
    }
    update_tag(&pool, "Old", "New", "green", "user_a")
        .await
        .unwrap();
    let ids = vec!["avatar_1".into()];
    assert_eq!(
        fetch_avatars_tags(&pool, &ids, "user_a").await.unwrap()["avatar_1"],
        vec![Tag {
            display_name: "New".into(),
            color: "green".into()
        }]
    );
    assert_eq!(
        count_tag_relations_of(&pool, "Old", "user_b")
            .await
            .unwrap(),
        1
    );
    drop_tag(&pool, "New", "user_a").await.unwrap();
    assert!(!query_tag_exists(&pool, "New", "user_a").await.unwrap());
    assert!(fetch_avatars_tags(&pool, &ids, "user_a")
        .await
        .unwrap()
        .is_empty());
    assert_eq!(
        count_tag_relations_of(&pool, "New", "user_a")
            .await
            .unwrap(),
        0
    );
    assert!(query_tag_exists(&pool, "Old", "user_b").await.unwrap());
    assert_eq!(
        count_tag_relations_of(&pool, "Old", "user_b")
            .await
            .unwrap(),
        1
    );
}

#[tokio::test]
async fn conflicting_rename_preserves_the_original_tag_and_assignments() {
    let pool = test_pool().await;
    create_tag(&pool, "First", "user_a", "red").await.unwrap();
    create_tag(&pool, "Second", "user_a", "blue").await.unwrap();
    create_tag_relation(&pool, "First", "avatar_1", "user_a")
        .await
        .unwrap();
    assert!(matches!(
        update_tag(&pool, "First", "Second", "green", "user_a").await,
        Err(DatabaseError::DuplicateTag(name)) if name == "Second"
    ));
    assert_eq!(
        count_tag_relations_of(&pool, "First", "user_a")
            .await
            .unwrap(),
        1
    );
    update_tag(&pool, "First", "First", "green", "user_a")
        .await
        .unwrap();
    let tags = query_all_tags_available(&pool, "user_a").await.unwrap();
    assert!(tags.contains(&Tag {
        display_name: "First".into(),
        color: "green".into()
    }));
}

#[tokio::test]
async fn assignments_are_idempotent_and_require_an_existing_tag() {
    let pool = test_pool().await;
    assert!(create_tag_relation(&pool, "Missing", "avatar_1", "user_a")
        .await
        .is_err());
    create_tag(&pool, "Tag", "user_a", "red").await.unwrap();
    assert!(create_tag_relation(&pool, "Tag", "avatar_1", "user_b")
        .await
        .is_err());
    for _ in 0..2 {
        create_tag_relation(&pool, "Tag", "avatar_1", "user_a")
            .await
            .unwrap();
    }
    create_tag_relation(&pool, "Tag", "avatar_2", "user_a")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Tag", "user_a")
            .await
            .unwrap(),
        2
    );
    drop_tag_relation(&pool, "Tag", "avatar_1", "user_b")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Tag", "user_a")
            .await
            .unwrap(),
        2
    );
    drop_tag_relation(&pool, "Tag", "avatar_1", "user_a")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Tag", "user_a")
            .await
            .unwrap(),
        1
    );
    drop_tag_relation(&pool, "Tag", "avatar_2", "user_a")
        .await
        .unwrap();
    assert_eq!(
        count_tag_relations_of(&pool, "Tag", "user_a")
            .await
            .unwrap(),
        0
    );
    assert!(query_tag_exists(&pool, "Tag", "user_a").await.unwrap());
}

#[tokio::test]
async fn avatar_tags_are_grouped_filtered_and_scoped_to_the_creator() {
    let pool = test_pool().await;
    for name in ["First", "Second"] {
        create_tag(&pool, name, "user_a", "red").await.unwrap();
        create_tag_relation(&pool, name, "avatar_1", "user_a")
            .await
            .unwrap();
    }
    create_tag_relation(&pool, "First", "avatar_2", "user_a")
        .await
        .unwrap();
    create_tag(&pool, "Private", "user_b", "blue")
        .await
        .unwrap();
    create_tag_relation(&pool, "Private", "avatar_1", "user_b")
        .await
        .unwrap();
    assert!(fetch_avatars_tags(&pool, &[], "user_a")
        .await
        .unwrap()
        .is_empty());
    let ids = vec!["avatar_1".into(), "avatar_2".into(), "avatar_3".into()];
    let tags = fetch_avatars_tags(&pool, &ids, "user_a").await.unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags["avatar_1"].len(), 2);
    assert!(tags["avatar_1"].iter().all(|tag| tag.color == "red"));
    assert_eq!(tags["avatar_2"].len(), 1);
    let filtered = fetch_avatars_tags(&pool, &["avatar_2".into()], "user_a")
        .await
        .unwrap();
    assert_eq!(filtered.len(), 1);
    assert!(filtered.contains_key("avatar_2"));
}

#[tokio::test]
async fn settings_are_upserted_and_survive_repeated_migrations() {
    let pool = test_pool().await;
    assert_eq!(query_client_config(&pool, "unset").await.unwrap(), "");
    update_client_config(&pool, "key", "first").await.unwrap();
    update_client_config(&pool, "key", "second").await.unwrap();
    create_tag(&pool, "Saved", "user_a", "red").await.unwrap();
    create_tag_relation(&pool, "Saved", "avatar_1", "user_a")
        .await
        .unwrap();
    sqlx::migrate!().run(&pool).await.unwrap();
    assert_eq!(query_client_config(&pool, "key").await.unwrap(), "second");
    assert_eq!(
        count_tag_relations_of(&pool, "Saved", "user_a")
            .await
            .unwrap(),
        1
    );
    assert_eq!(
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM _sqlx_migrations")
            .fetch_one(&pool)
            .await
            .unwrap(),
        4
    );
}
