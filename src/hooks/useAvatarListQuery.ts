import { AvatarListData, fetchAvatarList } from '@/lib/api';
import { AvatarSortOrder } from '@/lib/models';
import { getErrorMessage, notifyError } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useAvatarListQuery = (avatarSortOrder: AvatarSortOrder | undefined) => {
  const avatarListQuery = useQuery<AvatarListData>({
    queryKey: queryKeys.avatarList(avatarSortOrder),
    queryFn: async () => {
      if (!avatarSortOrder) throw new Error('avatarSortOrder is undefined');
      try {
        return await fetchAvatarList(avatarSortOrder);
      } catch (error) {
        console.error(error);
        const message = getErrorMessage(error, '不明なエラー');
        notifyError('アバターの読み込みに失敗しました', message);
        throw new Error(`Failed to fetch avatar list: ${message}`);
      }
    },
    enabled: !!avatarSortOrder,
  });
  return avatarListQuery;
};
