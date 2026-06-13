import {
  loadAvatarSortOrder,
  loadCardImageSize,
  loadCardNumberPerRow,
  saveAvatarSortOrder,
  saveCardImageSize,
  saveCardNumberPerRow,
} from '@/lib/db';
import { AvatarSortOrder } from '@/lib/models';
import { queryKeys } from '@/lib/queryKeys';
import { QueryKey, useQuery } from '@tanstack/react-query';

const useNumericSetting = (
  queryKey: QueryKey,
  load: () => Promise<number>,
  save: (value: number) => Promise<void>,
) => {
  const storeQuery = useQuery({
    queryKey,
    queryFn: load,
    staleTime: Infinity,
  });

  const setValue = async (newValue: string | null) => {
    if (!newValue) return;
    const parsed = parseInt(newValue, 10);
    if (isNaN(parsed)) return;
    await save(parsed);
    await storeQuery.refetch();
  };

  return {
    loading: storeQuery.isFetching || storeQuery.isPending,
    value: storeQuery.data,
    setValue,
  };
};

export const useAvatarSortOrderSetting = () => {
  const storeQuery = useQuery({
    queryKey: queryKeys.avatarSortOrder,
    queryFn: loadAvatarSortOrder,
    staleTime: Infinity,
  });

  const setAvatarSortOrder = async (newOrder: AvatarSortOrder | null) => {
    if (!newOrder) return;
    await saveAvatarSortOrder(newOrder);
    await storeQuery.refetch();
  };

  return {
    avatarSortOrder: storeQuery.data,
    setAvatarSortOrder,
  };
};

export const useCardImageSizeSetting = () => {
  const { loading, value, setValue } = useNumericSetting(
    queryKeys.cardImageSize,
    loadCardImageSize,
    saveCardImageSize,
  );
  return {
    cardImageSizeLoading: loading,
    cardImageSize: value,
    setCardImageSize: setValue,
  };
};

export const useCardNumberPerRowSetting = () => {
  const { loading, value, setValue } = useNumericSetting(
    queryKeys.cardNumberPerRow,
    loadCardNumberPerRow,
    saveCardNumberPerRow,
  );
  return {
    cardNumberPerRowLoading: loading,
    cardNumberPerRow: value,
    setCardNumberPerRow: setValue,
  };
};
