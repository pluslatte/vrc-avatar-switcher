import { Tag } from '@/lib/models';
import { getDb } from './client';

export const createTagRelation = async (
  tagName: string,
  avatarId: string,
  currentUserId: string,
) => {
  const db = await getDb();
  await db.execute(`
    INSERT OR IGNORE INTO tag_avatar_relations
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
  const db = await getDb();
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
  const db = await getDb();
  await db.execute(`
    DELETE FROM
      tag_avatar_relations
    WHERE
      tag_display_name = $1 AND avatar_id = $2 AND created_by = $3`,
    [tagName, avatarId, currentUserId]);
};

export const fetchAvatarsTags = async (
  avatarIds: Array<string>,
  currentUserId: string,
): Promise<Record<string, Array<Tag>>> => {
  if (avatarIds.length === 0) {
    return {};
  }

  const db = await getDb();
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
