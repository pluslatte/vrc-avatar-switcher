import { AvatarListData, switchAvatar } from '@/lib/api';
import { AvatarSortOrder } from '@/lib/models';
import { notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSwitchAvatarMutation = (avatarSortOrder: AvatarSortOrder | undefined) => {
  const queryClient = useQueryClient();
  const switchAvatarMutation = useMutation({
    mutationFn: switchAvatar,
    onSuccess: (currentUser) => {
      queryClient.setQueryData(
        queryKeys.avatarList(avatarSortOrder),
        (oldData: AvatarListData) => ({
          ...oldData,
          currentUser
        })
      );
      notifySuccess('成功', 'アバターの切り替えに成功しました');
    },
    onError: (error) => {
      notifyError('エラー', `アバターの切り替えに失敗しました: ${error.message}`);
    },
  });

  return switchAvatarMutation;
};
