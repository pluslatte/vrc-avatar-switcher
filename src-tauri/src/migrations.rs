use tauri_plugin_sql::{Migration, MigrationKind};

// 注意:
// - sqlx は適用済みマイグレーションの checksum（SQL 文字列のハッシュ）を検証するため、
//   既存の sql 文字列は空白や改行を含め一切変更しないこと（既存環境の起動が失敗する）。
//   スキーマ変更は必ず新しいバージョンの Migration を追加して行う。
// - フロントエンドのテスト（src/test/inMemoryDb.ts）がこのファイルをパースして
//   同じ SQL をテスト用 DB に適用している。`version: N` と `sql: "..."` の
//   記述形式を変える場合はパーサ側も更新すること。
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
                avatar_id NVARCHAR(255) NOT NULL,
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
    },
    Migration {
        version: 3,
        description: "Move client settings to a new table",
        sql: "
            CREATE TABLE IF NOT EXISTS client_settings (
                key VARCHAR(255) PRIMARY KEY,
                value VARCHAR(255) NOT NULL
            );
        ",
        kind: MigrationKind::Up,
    },
    Migration {
        version: 4,
        description: "Add ON UPDATE CASCADE to tag_avatar_relations foreign key",
        sql: "
            CREATE TABLE new_tag_avatar_relations (
                tag_display_name NVARCHAR(255) NOT NULL,
                avatar_id NVARCHAR(255) NOT NULL,
                created_by NVARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (tag_display_name, avatar_id, created_by),
                FOREIGN KEY (tag_display_name, created_by)
                    REFERENCES tags(display_name, created_by)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            );

            INSERT INTO new_tag_avatar_relations (tag_display_name, avatar_id, created_by, created_at)
            SELECT tag_display_name, avatar_id, created_by, created_at FROM tag_avatar_relations;

            DROP TABLE tag_avatar_relations;

            ALTER TABLE new_tag_avatar_relations RENAME TO tag_avatar_relations;
        ",
        kind: MigrationKind::Up,
    }
    ]
}
