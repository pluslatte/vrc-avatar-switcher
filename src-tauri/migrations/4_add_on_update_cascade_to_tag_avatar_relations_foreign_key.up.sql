
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
        