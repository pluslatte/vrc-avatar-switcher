import {
  command_check_auth,
  command_fetch_avatars,
  command_fetch_current_user,
  command_switch_avatar,
} from '@/lib/commands';
import { loadCookies } from '@/lib/db';
import { Avatar, AvatarSortOrder, CurrentUser } from '@/lib/models';

// 保存済み cookie を使って VRChat API を呼び出すセッション層。
// cookie を明示的に受け渡すログインフローは commands.ts を直接使う。

export interface AvatarListData {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
}

export const checkAuth = async (): Promise<boolean> => {
  const { authCookie, twofaCookie } = await loadCookies();
  if (authCookie === '' || twofaCookie === '') {
    return false;
  }
  return await command_check_auth(authCookie, twofaCookie);
};

export const fetchAvatarList = async (sortOrder: AvatarSortOrder): Promise<AvatarListData> => {
  const { authCookie, twofaCookie } = await loadCookies();
  return {
    avatars: await command_fetch_avatars(authCookie, twofaCookie, sortOrder),
    currentUser: await command_fetch_current_user(authCookie, twofaCookie),
  };
};

export const switchAvatar = async (avatarId: string): Promise<CurrentUser> => {
  const { authCookie, twofaCookie } = await loadCookies();
  return await command_switch_avatar(authCookie, twofaCookie, avatarId);
};
