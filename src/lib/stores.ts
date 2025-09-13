import { load } from '@tauri-apps/plugin-store';

const authCredentialsFileName = 'auth.json';

export const loadCookies = async (): Promise<{ authCookie: string; twofaCookie: string }> => {
  const store = await load(authCredentialsFileName);
  const authCookie = (await store.get('auth_cookie')) as string | undefined;
  const twofaCookie = (await store.get('two_fa_cookie')) as string | undefined;
  store.close();
  return {
    authCookie: authCookie || '',
    twofaCookie: twofaCookie || '',
  };
};

export const saveCookies = async (authCookie: string, twofaCookie: string | null): Promise<void> => {
  const store = await load(authCredentialsFileName);
  await store.set('auth_cookie', authCookie);
  await store.set('two_fa_cookie', twofaCookie);
  await store.save();
  store.close();
};

export const dropCookies = async (): Promise<void> => {
  const store = await load(authCredentialsFileName);
  await store.delete('auth_cookie');
  await store.delete('two_fa_cookie');
  await store.save();
  store.close();
};

const avatarListConfigImageSize = 'avatar_list_config_image_size.json';

export const saveCardImageSize = async (size: number | null): Promise<void> => {
  const store = await load(avatarListConfigImageSize);
  await store.set('card_image_size', size);
  await store.save();
  store.close();
};

export const loadCardImageSize = async (): Promise<number> => {
  const store = await load(avatarListConfigImageSize);
  const size = (await store.get('card_image_size')) as number | null | undefined;
  store.close();
  return size || 160;
};

const avatarListConfigNumberPerRow = 'avatar_list_config_number_per_row.json';

export const saveCardNumberPerRow = async (number: number | null): Promise<void> => {
  const store = await load(avatarListConfigNumberPerRow);
  await store.set('card_number_per_row', number);
  await store.save();
  store.close();
};

export const loadCardNumberPerRow = async (): Promise<number> => {
  const store = await load(avatarListConfigNumberPerRow);
  const number = (await store.get('card_number_per_row')) as number | null | undefined;
  store.close();
  return number || 3;
};

// "Avatar Tag" is pairs of string and array of avatar IDs.
const avatarTagStoreFileName = 'avatar_tags.json';

export const loadAvatarTags = async (): Promise<Record<string, string[]>> => {
  const store = await load(avatarTagStoreFileName);
  const tags = (await store.get('tags')) as Record<string, string[]> | undefined;
  store.close();
  return tags || {};
};

export const saveAvatarTags = async (tags: Record<string, string[]>): Promise<void> => {
  const store = await load(avatarTagStoreFileName);
  await store.set('tags', tags);
  await store.save();
  store.close();
};