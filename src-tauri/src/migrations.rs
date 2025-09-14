use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Create settings table",
            sql: "
                CREATE TABLE IF NOT EXISTS tags (
                display_name NVARCHAR(255) NOT NULL,
                color VARCHAR(255) NOT NULL,
                created_by NVARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (display_name, created_by)
            );

            CREATE TABLE IF NOT EXISTS tag_avatar_relations (
                tag_display_name NVARCHAR(255) NOT NULL,
                avatar_id NVARCHAR(255) NOT NULL,
                created_by NVARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (tag_display_name, avatar_id),
                FOREIGN KEY (tag_display_name, created_by)
                    REFERENCES tags(display_name, created_by)
                    ON DELETE CASCADE
        );",
        kind: MigrationKind::Up,
    },
    Migration {
        version: 2,
        description: "Add primary key (created_by) to tag_avatar_relations",
        sql: "
            CREATE TABLE IF NOT EXISTS new_tag_avatar_relations (
                tag_display_name NVARCHAR(255) NOT NULL,
                avatar_id NVARCHAR(255) NOT NULL,,
                created_by NVARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (tag_display_name, avatar_id, created_by),
                FOREIGN KEY (tag_display_name, created_by)
                    REFERENCES tags(display_name, created_by)
                    ON DELETE CASCADE
            );

            INSERT INTO new_tag_avatar_relations (tag_display_name, avatar_id, created_by, created_at)
            SELECT tag_display_name, avatar_id, created_by, created_at FROM tag_avatar_relations;

            DROP TABLE tag_avatar_relations;

            ALTER TABLE new_tag_avatar_relations RENAME TO tag_avatar_relations;
        ",
        kind: MigrationKind::Up,
    }]
}
