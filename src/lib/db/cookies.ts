import { queryClientConfig, updateClientConfig } from './settings';

export const loadCookies = async (): Promise<{ authCookie: string; twofaCookie: string }> => {
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
