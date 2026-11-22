import { useCallback, useEffect, useState } from 'react';
import { AvatarTags, mergeAvatarTags } from '@/lib/avatarTags';
import { Tag } from '@/lib/models';

export const usePendingAvatarTags = (relations: AvatarTags) => {
  const [pending, setPending] = useState<AvatarTags>({});

  useEffect(() => {
    setPending(previous => {
      const remaining = Object.entries(previous).map(([id, tags]) => [
        id,
        tags.filter(tag => !(relations[id] ?? []).some(base => base.display_name === tag.display_name)),
      ] as const);
      const changed = remaining.some(([id, tags]) => tags.length !== previous[id].length);
      return changed
        ? Object.fromEntries(remaining.filter(([, tags]) => tags.length > 0))
        : previous;
    });
  }, [relations]);

  const tagsOfAvatar = useCallback((id: string) =>
    mergeAvatarTags(relations[id] ?? [], pending[id] ?? []), [relations, pending]);

  const addPendingTag = useCallback((ids: Array<string>, tag: Tag) => {
    setPending(previous => ({
      ...previous,
      ...Object.fromEntries(ids.map(id => [id, mergeAvatarTags(previous[id] ?? [], [tag])])),
    }));
  }, []);

  return { tagsOfAvatar, addPendingTag };
};
