import Database from '@tauri-apps/plugin-sql';

export interface Tag {
  tag_display_name: string;
  color: string;
}

export const createTag = async (
  tagName: string,
  currentUserId: string,
  color: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    INSERT INTO
      tags
      (display_name, color, created_by)
    VALUES
      ($1, $2, $3)`,
    [tagName, color, currentUserId]
  );
};

export const queryTagExists = async (
  tagName: string,
  currentUserId: string
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const result = await db.select<Array<{ count: number }>>(
    `SELECT
      COUNT(*) AS count
    FROM
      tags
    WHERE
      display_name = $1 AND created_by = $2`,
    [tagName, currentUserId]
  );
  return result[0].count > 0;
};

export const queryAllTagsAvailable = async (
  currentUserId: string
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const result = await db.select<Array<Tag>>(
    `SELECT
      tag_display_name,
      color
    FROM
      tags
    WHERE
      created_by = $1`,
    [currentUserId]
  );
  return result;
};

export const dropTag = async (
  tagName: string,
  currentUserId: string
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    DELETE FROM
      tags
    WHERE
      display_name = $1 AND created_by = $2
  `, [tagName, currentUserId]);
};

export const createTagRelation = async (
  tagName: string,
  avatarId: string,
  currentUserId: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    INSERT INTO tag_avatar_relations
      (tag_display_name, avatar_id, created_by)
    VALUES
      ($1, $2, $3)`,
    [tagName, avatarId, currentUserId]
  );
};

export const dropTagRelation = async (
  tagName: string,
  avatarId: string,
  currentUserId: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    DELETE FROM
      tag_avatar_relations
    WHERE
      tag_display_name = $1 AND avatar_id = $2 AND created_by = $3`,
    [tagName, avatarId, currentUserId]);
};

export const fetchAvatarTags = async (
  avatar_id: string,
  currentUserId: string,
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
    [avatar_id, currentUserId]);

  return result;
};