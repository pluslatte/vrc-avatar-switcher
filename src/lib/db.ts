import Database from '@tauri-apps/plugin-sql';

export const createTag = async (
  tagName: string,
  username: string,
  color: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    INSERT INTO
      tags
      (display_name, color, created_by)
    VALUES
      ($1, $2, $3)`,
    [tagName, color, username]
  );
};

export const dropTag = async (
  tagName: string,
  username: string
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    DELETE FROM
      tags
    WHERE
      display_name = $1 AND created_by = $2
  `, [tagName, username]);
};

export const createTagRelation = async (
  tagName: string,
  avatarId: string,
  username: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    INSERT INTO tag_avatar_relations
      (tag_display_name, avatar_id, created_by)
    VALUES
      ($1, $2, $3)`,
    [tagName, avatarId, username]
  );
};

export const dropTagRelation = async (
  tagName: string,
  avatarId: string,
  username: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    DELETE FROM
      tag_avatar_relations
    WHERE
      tag_display_name = $1 AND avatar_id = $2 AND created_by = $3`,
    [tagName, avatarId, username]);
};

export interface Tag {
  display_name: string;
  color: string;
}
export const fetchAvatarTags = async (
  avatar_id: string,
  username: string,
): Promise<Array<Tag>> => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const result = await db.select<Array<Tag>>(
    `SELECT
      tag_display_name,
      color
    FROM
      tag_avatar_relations
    WHERE
      avatar_id = $1 AND created_by = $2`,
    [avatar_id, username]);

  return result;
};