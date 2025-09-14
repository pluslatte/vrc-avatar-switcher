import { command_fetch_avatars, command_fetch_current_user, command_switch_avatar } from '@/lib/commands';
import { Avatar, CurrentUser } from '@/lib/models';
import { loadCookies } from '@/lib/stores';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAvatarSortOrderSelector } from './useAvatarSortOrderSelector';
import { countTagRelationsOf, createTag, createTagRelation, dropTag, dropTagRelation, queryAllTagsAvailable, queryTagExists } from '@/lib/db';

interface AvatarListQuery {
  avatars: Array<Avatar>,
  currentUser: CurrentUser,
}
export const useAvatarSwitcher = () => {
  const queryClient = useQueryClient();
  const { avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSortOrderSelector();

  const avatarListQuery = useQuery<AvatarListQuery>({
    queryKey: ['avatarList', avatarSortOrder],
    queryFn: async () => {
      if (!avatarSortOrder) throw new Error('avatarSortOrder is undefined');
      const { authCookie, twofaCookie } = await loadCookies();
      return {
        avatars: await command_fetch_avatars(authCookie, twofaCookie, avatarSortOrder),
        currentUser: await command_fetch_current_user(authCookie, twofaCookie),
      };
    },
    enabled: !!avatarSortOrder,
  });

  const switchAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const { authCookie, twofaCookie } = await loadCookies();
      return await command_switch_avatar(authCookie, twofaCookie, avatarId);
    },
    onSuccess: (currentUser) => {
      queryClient.setQueryData(['avatarList', avatarSortOrder], (oldData: AvatarListQuery) => ({
        ...oldData,
        currentUser
      }));
      notifications.show({
        title: '成功',
        message: 'アバターの切り替えに成功しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'エラー',
        message: `アバターの切り替えに失敗しました: ${error.message}`,
        color: 'red',
      });
    },
  });

  const tagQuery = useQuery({
    queryKey: ['tags', avatarListQuery.data?.currentUser.id],
    queryFn: async () => {
      if (!avatarListQuery.data?.currentUser?.id) throw new Error('Current user ID is undefined');
      const tags = await queryAllTagsAvailable(avatarListQuery.data?.currentUser.id);
      return tags;
    },
    enabled: !!avatarListQuery.data?.currentUser?.id,
  });

  const handlerRefetchAvatar = async () => {
    await avatarListQuery.refetch();
  };

  const handleRegisterAvatarTag = async (tagName: string, currentUserId: string, avatarId: string, color: string) => {
    const tagExists = await queryTagExists(tagName, currentUserId);
    try {
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifications.show({
          title: 'タグ作成',
          message: `タグ「${tagName}」を新規作成しました`,
          color: 'green',
        });
        await tagQuery.refetch();
      }
      await createTagRelation(tagName, avatarId, currentUserId);
    } catch (error) {
      console.error('Error registering avatar tag:', error);
      notifications.show({
        title: 'タグ登録エラー',
        message: `タグ「${tagName}」の登録中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

  const handleRemoveAvatarTag = async (tagName: string, avatarId: string, currentUserId: string) => {
    try {
      await dropTagRelation(tagName, avatarId, currentUserId);
      const remainingTagRelations = await countTagRelationsOf(tagName, currentUserId);
      if (remainingTagRelations === 0) {
        await dropTag(tagName, currentUserId);
        notifications.show({
          title: 'タグ削除',
          message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
          color: 'green',
        });
        await tagQuery.refetch();
      }
    } catch (error) {
      console.error('Error removing avatar tag:', error);
      notifications.show({
        title: 'タグ削除エラー',
        message: `タグ「${tagName}」の削除中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    }
  };

  const handlerDropTag = async (tagName: string, currentUserId: string) => {
    await dropTag(tagName, currentUserId);
    await tagQuery.refetch();
    notifications.show({
      title: 'タグ削除',
      message: `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`,
      color: 'green',
    });
  };

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  return {
    avatarListQuery,
    switchAvatarMutation,
    avatarSortOrder,
    tagsLoading: tagQuery.isPending,
    availableTags: tagQuery.data,
    handleAvatarSortOrderChange,
    handlerAvatarSwitch,
    handlerRefetchAvatar,
    handleRegisterAvatarTag,
    handleRemoveAvatarTag,
    handlerDropTag,
  };
};