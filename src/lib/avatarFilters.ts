import { Avatar } from './models';
import { AvatarTags } from './avatarTags';

export const filterAvatarsByTags = (
  avatars: Array<Avatar>,
  selectedTags: Array<string>,
  relations: AvatarTags,
): Array<Avatar> => avatars.filter(avatar =>
  selectedTags.every(name => (relations[avatar.id] ?? []).some(tag => tag.display_name === name)),
);

export const filterAvatarsByName = (avatars: Array<Avatar>, searchQuery: string): Array<Avatar> => {
  const query = searchQuery.toLowerCase();
  return searchQuery.trim() === ''
    ? avatars
    : avatars.filter(avatar => avatar.name.toLowerCase().includes(query));
};
