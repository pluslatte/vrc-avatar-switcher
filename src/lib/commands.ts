import { invoke } from '@tauri-apps/api/core';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';

// セッション（cookie）は Rust 側の SessionState が保持・永続化する。
// フロントエンドは認証情報に直接触れない。

export type LoginStatus = 'Success' | 'Requires2FA' | 'RequiresEmail2FA';

export type AuthCheckResult = 'LoggedOut' | 'NeedsReauth' | 'Authenticated';

export const command_fetch_avatars = async (
  sortOption: AvatarSortOrder
): Promise<Avatar[]> => {
  return await invoke<Avatar[]>('command_fetch_avatars', { sortOption });
};

export const command_new_auth = async (
  username: string,
  password: string
): Promise<LoginStatus> => {
  return await invoke<LoginStatus>('command_new_auth', {
    username,
    password,
  });
};

export const command_2fa = async (
  username: string,
  password: string,
  twoFaCode: string
): Promise<void> => {
  return await invoke<void>('command_2fa', {
    username,
    password,
    twoFaCode
  });
};

export const command_email_2fa = async (
  username: string,
  password: string,
  twoFaCode: string
): Promise<void> => {
  return await invoke<void>('command_email_2fa', {
    username,
    password,
    twoFaCode
  });
};

export const command_check_auth = async (): Promise<AuthCheckResult> => {
  return await invoke<AuthCheckResult>('command_check_auth');
};

export const command_fetch_current_user = async (): Promise<CurrentUser> => {
  return await invoke<CurrentUser>('command_fetch_current_user');
};

export const command_switch_avatar = async (
  avatarId: string
): Promise<CurrentUser> => {
  return await invoke<CurrentUser>('command_switch_avatar', { avatarId });
};

export const command_logout = async (): Promise<void> => {
  return await invoke<void>('command_logout');
};
