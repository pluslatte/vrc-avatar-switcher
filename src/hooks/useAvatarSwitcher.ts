import { useAvatarSortOrderSelector } from './useAvatarSortOrderSelector';
import { useAvatarListQuery } from './useAvatarListQuery';
import { useSwitchAvatarMutation } from './useSwitchAvatarMutation';
import { useAvailableTagsQuery } from './useAvailableTagsQuery';
import { useTagAvatarsRelationQuery } from './useTagAvatarsRelationQuery';

export const useAvatarSwitcher = () => {
  const { avatarSortOrder, handleAvatarSortOrderChange } = useAvatarSortOrderSelector();

  const avatarListQuery = useAvatarListQuery(avatarSortOrder);
  const switchAvatarMutation = useSwitchAvatarMutation(avatarSortOrder);
  const availableTagsQuery = useAvailableTagsQuery(avatarListQuery.data);

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  const tagAvatarsRelationQuery = useTagAvatarsRelationQuery(avatarListQuery.data);

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
  };
};