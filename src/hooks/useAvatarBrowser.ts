import { useAvatarListQuery } from '@/hooks/useAvatarListQuery';
import { useSwitchAvatarMutation } from '@/hooks/useSwitchAvatarMutation';
import { useAvailableTagsQuery } from '@/hooks/useAvailableTagsQuery';
import { useTagAvatarsRelationQuery } from '@/hooks/useTagAvatarsRelationQuery';
import {
  useAvatarSortOrderSetting,
  useCardImageSizeSetting,
  useCardColumnSpanSetting,
} from '@/hooks/useClientSettings';
import { isAvatarSortOrder } from '@/lib/models';
import { useState } from 'react';
import { useAvatarSearchByName } from '@/hooks/useAvatarSearchByName';
import { AuthStatus } from '@/lib/authStatus';

export const useAvatarBrowser = (authStatus: AuthStatus) => {
  const isAuthenticated = authStatus === 'authenticated';
  const { avatarSortOrder, setAvatarSortOrder } = useAvatarSortOrderSetting();
  const avatarListQuery = useAvatarListQuery(avatarSortOrder, isAuthenticated);
  const switchAvatarMutation = useSwitchAvatarMutation();

  const currentUserId = avatarListQuery.data?.currentUser.id;
  const availableTagsQuery = useAvailableTagsQuery(currentUserId);
  const tagAvatarsRelationQuery = useTagAvatarsRelationQuery(
    currentUserId,
    avatarListQuery.data?.avatars.map(avatar => avatar.id) ?? [],
  );

  const { cardImageSizeLoading, cardImageSize, setCardImageSize } = useCardImageSizeSetting();
  const { cardColumnSpanLoading, cardColumnSpan, setCardColumnSpan } = useCardColumnSpanSetting();
  const { avatarSearchQueryValueDeferred, setAvatarSearchQueryValue } = useAvatarSearchByName();
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

  const handleSortOrderChange = (option: string | null) => {
    if (isAvatarSortOrder(option)) {
      void setAvatarSortOrder(option);
    }
  };

  return {
    avatarSortOrder, avatarListQuery, switchAvatarMutation,
    availableTagsQuery, tagAvatarsRelationQuery,
    cardImageSizeLoading, cardImageSize, setCardImageSize,
    cardColumnSpanLoading, cardColumnSpan, setCardColumnSpan,
    avatarSearchQueryValueDeferred, setAvatarSearchQueryValue,
    selectedTags, setSelectedTags, handleSortOrderChange,
  };
};
