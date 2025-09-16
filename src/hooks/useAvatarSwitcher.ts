import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useAvatarSortOrderSelector } from './useAvatarSortOrderSelector';
import { countTagRelationsOf, createTag, createTagRelation, dropTag, dropTagRelation, fetchAvatarsTags, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import { useAvatarListQuery } from './useAvatarListQuery';
import { useSwitchAvatarMutation } from './useSwitchAvatarMutation';

export const useAvatarSwitcher = () => {
  const { avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSortOrderSelector();

  const avatarListQuery = useAvatarListQuery(avatarSortOrder);
  const switchAvatarMutation = useSwitchAvatarMutation(avatarSortOrder);

  const availableTagsQuery = useQuery({
    queryKey: ['tags', avatarListQuery.data?.currentUser.id],
    queryFn: async () => {
      if (!avatarListQuery.data?.currentUser?.id) throw new Error('Current user ID is undefined');
      const tags = await queryAllTagsAvailable(avatarListQuery.data?.currentUser.id);
      return tags;
    },
    enabled: !!avatarListQuery.data?.currentUser?.id,
  });

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  const tagAvatarsRelationQuery = useQuery({
    queryKey: ['tags', avatarListQuery.data?.currentUser.id, avatarListQuery.data?.avatars.map(a => a.id), avatarListQuery.data?.avatars.length],
    queryFn: () => {
      if (!avatarListQuery.data?.avatars.length || !avatarListQuery.data?.currentUser.id) throw new Error('Avatars or Current user ID is undefined');
      const tagAvatarsRelation = fetchAvatarsTags(avatarListQuery.data?.avatars.map(a => a.id), avatarListQuery.data?.currentUser.id);
      return tagAvatarsRelation;
    },
    enabled: !!avatarListQuery.data?.avatars && !!avatarListQuery.data?.currentUser,
  });

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
        await availableTagsQuery.refetch();
      }
      await createTagRelation(tagName, avatarId, currentUserId);
      await tagAvatarsRelationQuery.refetch();
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
        await availableTagsQuery.refetch();
      }
      await tagAvatarsRelationQuery.refetch();
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
    await availableTagsQuery.refetch();
    await tagAvatarsRelationQuery.refetch();
    notifications.show({
      title: 'タグ削除',
      message: `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`,
      color: 'green',
    });
  };

  return {
    avatarListQuery,
    switchAvatarMutation,
    avatarSortOrder,
    tagsLoading: availableTagsQuery.isPending,
    availableTags: availableTagsQuery.data,
    tagAvatarRelationLoading: tagAvatarsRelationQuery.isPending,
    tagAvatarRelation: tagAvatarsRelationQuery.data,
    handleAvatarSortOrderChange,
    handlerAvatarSwitch,
    handleRegisterAvatarTag,
    handleRemoveAvatarTag,
    handlerDropTag,
  };
};