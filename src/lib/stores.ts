import { load } from '@tauri-apps/plugin-store';

const storeFileName = 'auth.json';

export const loadCookies = async (): Promise<{ authCookie: string; twofaCookie: string }> => {
  const store = await load(storeFileName);
  const authCookie = (await store.get('auth_cookie')) as string | undefined;
  const twofaCookie = (await store.get('two_fa_cookie')) as string | undefined;
  store.close();
  return {
    authCookie: authCookie || '',
    twofaCookie: twofaCookie || '',
  };
};

export const saveCookies = async (authCookie: string, twofaCookie: string | null): Promise<void> => {
  const store = await load(storeFileName);
  await store.set('auth_cookie', authCookie);
  await store.set('two_fa_cookie', twofaCookie);
  await store.save();
  store.close();
};