export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailImageUrl: string;
}

export interface CurrentUser {
  id: string;
  displayName: string;
  currentAvatar: string;
  currentAvatarThumbnailImageUrl: string;
}

export type AvatarSortOrder = 'Name' | 'Updated';
export const isAvatarSortOrder = (option: unknown): option is AvatarSortOrder => {
  return option === 'Name' || option === 'Updated';
};