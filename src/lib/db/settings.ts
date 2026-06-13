import { AvatarSortOrder } from '@/lib/models';
import { getDb } from './client';

export const queryClientConfig = async (
  key: string,
): Promise<string> => {
  const db = await getDb();
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

export const updateClientConfig = async (
  key: string,
  value: string,
): Promise<void> => {
  const db = await getDb();
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
