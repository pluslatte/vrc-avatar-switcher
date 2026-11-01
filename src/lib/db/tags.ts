import { Tag } from '@/lib/models';
import { getDb } from './client';

export const createTag = async (
  tagName: string,
  currentUserId: string,
  color: string,
) => {
  const exists = await queryTagExists(tagName, currentUserId);
  if (exists) {
    throw new Error(`タグ名「${tagName}」は既に存在します`);
  }

  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
  await db.execute(`
    DELETE FROM
      tags
    WHERE
      display_name = $1 AND created_by = $2
  `, [tagName, currentUserId]);
};

export const updateTag = async (
  oldTagName: string,
  newTagName: string,
  newColor: string,
  currentUserId: string,
) => {
  if (oldTagName !== newTagName) {
    const exists = await queryTagExists(newTagName, currentUserId);
    if (exists) {
      throw new Error(`タグ名「${newTagName}」は既に存在します`);
    }
  }

  const db = await getDb();
  await db.execute(`
    UPDATE
      tags
    SET
      display_name = $1,
      color = $2
    WHERE
      display_name = $3 AND created_by = $4
  `, [newTagName, newColor, oldTagName, currentUserId]);
};
