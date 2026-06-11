import { AvatarSortOrder } from '@/lib/models';

// TanStack Query のキーはここで一元管理する。
// invalidateQueries はプレフィックス一致なので、
// 引数を省略した形のキーで配下のクエリをまとめて無効化できる。
export const queryKeys = {
  authCheck: ['auth_check'] as const,
  avatarListAll: ['avatar_list'] as const,
  avatarList: (sortOrder: AvatarSortOrder | undefined) =>
    ['avatar_list', sortOrder] as const,
  availableTags: (currentUserId: string | undefined) =>
    ['available_tags', currentUserId] as const,
  tagAvatarRelationsAll: (currentUserId: string | undefined) =>
    ['tag_avatar_relations', currentUserId] as const,
  tagAvatarRelations: (currentUserId: string | undefined, avatarIds: Array<string>) =>
    ['tag_avatar_relations', currentUserId, avatarIds] as const,
  avatarSortOrder: ['avatar_sort_order'] as const,
  cardImageSize: ['card_image_size'] as const,
  cardNumberPerRow: ['card_number_per_row'] as const,
};
