import { command_switch_avatar } from '@/lib/commands';
import { AvatarSortOrder } from '@/lib/models';
import { getErrorMessage, notifyError, notifySuccess } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AvatarListData } from './useAvatarListQuery';

export const useSwitchAvatarMutation = (avatarSortOrder: AvatarSortOrder | undefined) => {
  const queryClient = useQueryClient();
  const switchAvatarMutation = useMutation({
    mutationFn: command_switch_avatar,
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
      notifyError('エラー', `アバターの切り替えに失敗しました: ${getErrorMessage(error, '不明なエラー')}`);
    },
  });

  return switchAvatarMutation;
};
