import { Avatar } from './models';

export const avatarTagSearchFilterAvatars = (
  avatars: Array<Avatar>,
  selectedTags: Array<string>,
  tagAvatarRelation: Record<string, Array<{ display_name: string; color: string }>> | undefined
): Array<Avatar> => (
  avatars.filter(avatar => {
    if (selectedTags.length === 0) {
      return true;
    }
    if (tagAvatarRelation === undefined) {
      return false;
    }
    const tags = tagAvatarRelation[avatar.id] || [];
    return selectedTags.every(tag => tags.some(t => t.display_name === tag));
  })
);

export const avatarNameSearchFilterAvatars = (
  avatars: Array<Avatar>,
  searchQuery: string,
): Array<Avatar> => (
  avatars.filter(avatar => {
    if (searchQuery.trim() === '') {
      return true;
    }
    return avatar.name.toLowerCase().includes(searchQuery.toLowerCase());
  })
);