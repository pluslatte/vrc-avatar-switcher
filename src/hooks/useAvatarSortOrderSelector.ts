import { AvatarSortOrder } from '@/lib/models';
import { loadAvatarSortOrder, saveAvatarSortOrder } from '@/lib/stores';
import { useQuery } from '@tanstack/react-query';

export const useAvatarSortOrderSelector = () => {
  const storeQuery = useQuery({
    queryKey: ['avatarSortOrder'],
    queryFn: loadAvatarSortOrder,
    staleTime: Infinity,
  });

  const handleAvatarSortOrderChange = async (newOrder: AvatarSortOrder | null) => {
    if (!newOrder) return;
    await saveAvatarSortOrder(newOrder);
    await storeQuery.refetch();
  };

  return {
    avatarSortOrder: storeQuery.data,
    handleAvatarSortOrderChange,
  };
};