import { invoke } from '@tauri-apps/api/core';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';

export const command_fetch_avatars = async (
  rawAuthCookie: string,
  raw2faCookie: string,
  sortOption: AvatarSortOrder
): Promise<Avatar[]> => {
  return await invoke<Avatar[]>('command_fetch_avatars', {
    rawAuthCookie,
    raw2faCookie,
    sortOption
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
    twoFaCode: email2FaCode
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

export const command_fetch_current_user = async (
  rawAuthCookie: string,
  raw2faCookie: string
): Promise<CurrentUser> => {
  return await invoke<CurrentUser>('command_fetch_current_user', {
    rawAuthCookie,
    raw2faCookie
  });
};

export const command_switch_avatar = async (
  rawAuthCookie: string,
  raw2faCookie: string,
  avatarId: string
): Promise<CurrentUser> => {
  return await invoke<CurrentUser>('command_switch_avatar', {
    rawAuthCookie,
    raw2faCookie,
    avatarId
  });
};
