/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

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
