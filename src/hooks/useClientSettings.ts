import {
  loadAvatarSortOrder,
  loadCardImageSize,
  loadCardColumnSpan,
  saveAvatarSortOrder,
  saveCardImageSize,
  saveCardColumnSpan,
} from '@/lib/db';
import { queryKeys } from '@/lib/queryKeys';
import { useStoredSetting } from './useStoredSetting';

export const useAvatarSortOrderSetting = () => {
  const { value, setValue } = useStoredSetting(
    queryKeys.avatarSortOrder, loadAvatarSortOrder, saveAvatarSortOrder,
  );

  return {
    avatarSortOrder: value,
    setAvatarSortOrder: setValue,
  };
};

export const useCardImageSizeSetting = () => {
  const { loading, value, setValue } = useStoredSetting(
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

export const useCardColumnSpanSetting = () => {
  const { loading, value, setValue } = useStoredSetting(
    queryKeys.cardColumnSpan,
    loadCardColumnSpan,
    saveCardColumnSpan,
  );
  return {
    cardColumnSpanLoading: loading,
    cardColumnSpan: value,
    setCardColumnSpan: setValue,
  };
};
