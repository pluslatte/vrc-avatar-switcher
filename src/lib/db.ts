import Database from '@tauri-apps/plugin-sql';
import { AvatarSortOrder } from './models';

export interface Tag {
  display_name: string;
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
      display_name,
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

export const countTagRelationsOf = async (
  tagName: string,
  currentUserId: string,
) => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const result = await db.select<Array<{ count: number }>>(
    `SELECT
      COUNT(*) AS count
    FROM
      tag_avatar_relations
    WHERE
      tag_display_name = $1 AND created_by = $2`,
    [tagName, currentUserId]
  );
  return result[0].count;
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
  const tags = await db.select<Array<Tag>>(
    `SELECT
      tar.tag_display_name AS display_name,
      t.color
    FROM
      tag_avatar_relations AS tar
    JOIN
      tags AS t
    ON
      tar.tag_display_name = t.display_name
      AND tar.created_by = t.created_by
    WHERE
      tar.avatar_id = $1 AND tar.created_by = $2`,
    [avatar_id, currentUserId]);

  return tags;
};

export const fetchAvatarsTags = async (
  avatarIds: Array<string>,
  currentUserId: string,
): Promise<Record<string, Array<Tag>>> => {
  if (avatarIds.length === 0) {
    return {};
  }

  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const placeholders = avatarIds.map((_, index) => `$${index + 1}`).join(', ');
  const query = `
    SELECT
      tar.avatar_id,
      tar.tag_display_name AS display_name,
      t.color
    FROM
      tag_avatar_relations AS tar
    JOIN
      tags AS t
    ON
      tar.tag_display_name = t.display_name
      AND tar.created_by = t.created_by
    WHERE
      tar.avatar_id IN (${placeholders}) AND tar.created_by = $${avatarIds.length + 1}
  `;
  const params = [...avatarIds, currentUserId];
  const rows = await db.select<Array<{ avatar_id: string; display_name: string; color: string }>>(query, params);
  const result: Record<string, Array<Tag>> = {};
  rows.forEach(row => {
    if (!result[row.avatar_id]) {
      result[row.avatar_id] = [];
    }
    result[row.avatar_id].push({ display_name: row.display_name, color: row.color });
  });
  return result;
};

const queryClientConfig = async (
  key: string,
): Promise<string> => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  const rows = await db.select<Array<{ value: string }>>(
    `SELECT
      value
    FROM
      client_settings
    WHERE
      key = $1`,
    [key]
  );
  if (rows.length === 0) return '';
  return rows[0].value || '';
};

const updateClientConfig = async (
  key: string,
  value: string,
): Promise<void> => {
  const db = await Database.load('sqlite:vrc-avatar-switcher.db');
  await db.execute(`
    INSERT INTO
      client_settings (key, value)
    VALUES
      ($1, $2)
    ON CONFLICT (key) DO UPDATE SET
      value = $2
  `, [key, value]);
};

export const saveAvatarSortOrder = async (order: AvatarSortOrder | null): Promise<void> => {
  await updateClientConfig('avatar_sort_order', order || 'Updated');
};

export const loadAvatarSortOrder = async (): Promise<AvatarSortOrder> => {
  const value = await queryClientConfig('avatar_sort_order');
  return (
    value === 'Name' ||
    value === 'Updated'
  ) ? value : 'Updated';
};

export const saveCardImageSize = async (size: number | null): Promise<void> => {
  await updateClientConfig('card_image_size', (size || 160).toString());
};

export const loadCardImageSize = async (): Promise<number> => {
  const value = await queryClientConfig('card_image_size');
  const size = parseInt(value, 10);
  return isNaN(size) ? 160 : size;
};

export const saveCardNumberPerRow = async (number: number | null): Promise<void> => {
  await updateClientConfig('card_number_per_row', (number || 3).toString());
};

export const loadCardNumberPerRow = async (): Promise<number> => {
  const value = await queryClientConfig('card_number_per_row');
  const number = parseInt(value, 10);
  return isNaN(number) ? 3 : number;
};

export const loadCookies = async (): Promise<{ authCookie: string; twofaCookie: string }> => {
  console.log('loadCookies');
  const auth = await queryClientConfig('auth_cookie');
  const twofa = await queryClientConfig('two_fa_cookie');
  return {
    authCookie: auth || '',
    twofaCookie: twofa || '',
  };
};

export const saveCookies = async (authCookie: string, twofaCookie: string | null): Promise<void> => {
  await updateClientConfig('auth_cookie', authCookie);
  await updateClientConfig('two_fa_cookie', twofaCookie || '');
};

export const dropCookies = async (): Promise<void> => {
  await updateClientConfig('auth_cookie', '');
  await updateClientConfig('two_fa_cookie', '');
};