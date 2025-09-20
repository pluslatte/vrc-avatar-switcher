import { dropTagRelation, countTagRelationsOf, dropTag } from '@/lib/db';
import { notifications } from '@mantine/notifications';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { availableTagsQueryKey } from './useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from './useTagAvatarsRelationQuery';
import { Avatar } from '@/lib/models';

export const useTagAvatarsRelationMutation = (avatars: Array<Avatar>) => {
  const queryClient = useQueryClient();
  const removeTagAvatarsRelationMutation = useMutation({
    mutationFn: async (params: { tagName: string; avatarId: string; currentUserId: string }) => {
      await dropTagRelation(params.tagName, params.avatarId, params.currentUserId);
      return { tagName: params.tagName, currentUserId: params.currentUserId };
    },
    onSuccess: async (variables) => {
      const { tagName, currentUserId } = variables;
      const remainingTagRelations = await countTagRelationsOf(tagName, currentUserId);
      if (remainingTagRelations === 0) {
        await dropTag(tagName, currentUserId);
        notifications.show({
          title: 'タグ削除',
          message: `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`,
          color: 'green',
        });
        queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(avatars, currentUserId) });
    },
    onError: (error, variables) => {
      const { tagName } = variables;
      console.error('Error removing avatar tag:', error);
      notifications.show({
        title: 'タグ削除エラー',
        message: `タグ「${tagName}」の削除中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    },
  });

  return { removeTagAvatarsRelation: removeTagAvatarsRelationMutation.mutate };
};