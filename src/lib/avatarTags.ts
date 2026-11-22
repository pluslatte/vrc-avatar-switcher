import { Tag } from './models';

export type AvatarTags = Record<string, Array<Tag>>;

export const commonAvatarTags = (avatarIds: Array<string>, relations: AvatarTags): Array<Tag> => {
  if (avatarIds.length === 0) return [];
  const [firstId, ...restIds] = avatarIds;
  return restIds.reduce(
    (common, id) => common.filter(tag =>
      (relations[id] ?? []).some(candidate => candidate.display_name === tag.display_name)),
    relations[firstId] ?? [],
  );
};

export const mergeAvatarTags = (tags: Array<Tag>, pending: Array<Tag>): Array<Tag> => {
  const names = new Set(tags.map(tag => tag.display_name));
  return [...tags, ...pending.filter(tag => !names.has(tag.display_name))];
};
