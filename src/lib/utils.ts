import { Avatar } from './models';

export const avatarTagSearchfilterAvatars = (
  avatars: Array<Avatar>,
  selectedTags: Array<string>,
  tagAvatarRelation: Record<string, Array<{ display_name: string; color: string }>> | undefined
) => (
  avatars.filter(avatar => {
      if (selectedTags.length === 0) {
        return true;
      }
      if (tagAvatarRelation === undefined) {
        return false;
      }
      const tags = tagAvatarRelation[avatar.id] || [];
      return selectedTags.every(tag => tags.some(t => t.display_name === tag));
    }
  )
);