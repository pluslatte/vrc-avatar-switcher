import { AvatarSortOrder } from '@/lib/models';
import { invokeDatabaseCommand } from './client';

export const queryClientConfig = (key: string): Promise<string> =>
  invokeDatabaseCommand('command_query_client_config', { key });

export const updateClientConfig = (key: string, value: string): Promise<void> =>
  invokeDatabaseCommand('command_update_client_config', { key, value });

export const saveAvatarSortOrder = async (order: AvatarSortOrder): Promise<void> => {
  await updateClientConfig('avatar_sort_order', order);
};

export const loadAvatarSortOrder = async (): Promise<AvatarSortOrder> => {
  const value = await queryClientConfig('avatar_sort_order');
  return (
    value === 'Name' ||
    value === 'Updated'
  ) ? value : 'Updated';
};

export const saveCardImageSize = async (size: number): Promise<void> => {
  await updateClientConfig('card_image_size', size.toString());
};

export const loadCardImageSize = async (): Promise<number> => {
  const value = await queryClientConfig('card_image_size');
  const size = parseInt(value, 10);
  return isNaN(size) ? 160 : size;
};

export const saveCardColumnSpan = async (number: number): Promise<void> => {
  await updateClientConfig('card_number_per_row', number.toString());
};

export const loadCardColumnSpan = async (): Promise<number> => {
  const value = await queryClientConfig('card_number_per_row');
  const number = parseInt(value, 10);
  return isNaN(number) ? 3 : number;
};
