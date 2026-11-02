
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
        );