import { invoke } from '@tauri-apps/api/core';

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailImageUrl: string;
}

export const command_fetch_avatars = async (
  rawAuthCookie: string,
  raw2faCookie: string
): Promise<Avatar[]> => {
  return await invoke<Avatar[]>('command_fetch_avatars', {
    rawAuthCookie,
    raw2faCookie,
  });
};

interface CommandLoginOk {
  status: 'Success' | 'Requires2FA' | 'RequiresEmail2FA';
  auth_cookie: string;
  two_fa_cookie: string | null;
}

export const command_new_auth = async (
  username: string,
  password: string
): Promise<CommandLoginOk> => {
  return await invoke<CommandLoginOk>('command_new_auth', {
    username,
    password,
  });
};

interface Command2FAOk {
  auth_cookie: string;
  two_fa_cookie: string | null;
}

export const command_2fa = async (
  rawAuthCookie: string,
  raw2faCookie: string,
  username: string,
  password: string,
  twoFaCode: string
): Promise<Command2FAOk> => {
  return await invoke<Command2FAOk>('command_2fa', {
    rawAuthCookie,
    raw2faCookie,
    username,
    password,
    twoFaCode
  });
};

export const command_email_2fa = async (
  rawAuthCookie: string,
  raw2faCookie: string,
  username: string,
  password: string,
  email2FaCode: string
): Promise<Command2FAOk> => {
  return await invoke<Command2FAOk>('command_email_2fa', {
    rawAuthCookie,
    raw2faCookie,
    username,
    password,
    email2FaCode
  });
};

export const command_check_auth = async (
  rawAuthCookie: string,
  raw2faCookie: string
): Promise<boolean> => {
  return await invoke<boolean>('command_check_auth', {
    rawAuthCookie,
    raw2faCookie
  });
};