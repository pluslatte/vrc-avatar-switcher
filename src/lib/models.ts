export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailImageUrl: string;
}

export interface CurrentUser {
  displayName: string;
  currentAvatar: string;
  currentAvatarThumbnailImageUrl: string;
}