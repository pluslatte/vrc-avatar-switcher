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

const cardImageSizeFileName = 'card_image_size.json';
export const saveCardImageSize = async (size: number | null): Promise<void> => {
  const store = await load(cardImageSizeFileName);
  await store.set('card_image_size', size);
  await store.save();
  store.close();
};

export const loadCardImageSize = async (): Promise<number | null> => {
  const store = await load(cardImageSizeFileName);
  const size = (await store.get('card_image_size')) as number | null | undefined;
  store.close();
  return size || null;
};