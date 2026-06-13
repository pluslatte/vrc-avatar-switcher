import { dropTagRelation, countTagRelationsOf, dropTag } from '@/lib/db';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export const useTagAvatarsRelationMutation = () => {
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
        notifySuccess('タグ削除', `タグ「${tagName}」は他に関連付けられたアバターがないため削除されました`);
        queryClient.invalidateQueries({ queryKey: queryKeys.availableTags(currentUserId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tagAvatarRelationsAll(currentUserId) });
    },
    onError: (error, variables) => {
      const { tagName } = variables;
      console.error('Error removing avatar tag:', error);
      const message = getErrorMessage(error, 'タグの削除中にエラーが発生しました');
      notifyError('タグ削除エラー', `タグ「${tagName}」: ${message}`);
    },
  });

  return {
    removeTagAvatarsRelation: removeTagAvatarsRelationMutation.mutate,
    removeTagAvatarsRelationAsync: removeTagAvatarsRelationMutation.mutateAsync,
    isRemovingTagRelation: removeTagAvatarsRelationMutation.isPending,
  };
};
