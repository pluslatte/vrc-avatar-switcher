import type { Tag } from '@/lib/models';

type StoredTag = Tag & { userId: string };
type Relation = { tagName: string; avatarId: string; userId: string };

export const createTestTagStore = () => {
  let tags: Array<StoredTag> = [];
  let relations: Array<Relation> = [];

  return {
    createTag: async (tagName: string, userId: string, color: string) => {
      tags = [...tags, { display_name: tagName, color, userId }];
    },
    queryTagExists: async (tagName: string, userId: string) =>
      tags.some(tag => tag.display_name === tagName && tag.userId === userId),
    queryAllTagsAvailable: async (userId: string) =>
      tags.filter(tag => tag.userId === userId).map(({ display_name, color }) => ({ display_name, color })),
    updateTag: async (oldName: string, newName: string, color: string, userId: string) => {
      if (oldName !== newName && tags.some(tag => tag.display_name === newName && tag.userId === userId)) {
        throw new Error(`タグ名「${newName}」は既に存在します`);
      }
      tags = tags.map(tag => tag.display_name === oldName && tag.userId === userId
        ? { display_name: newName, color, userId } : tag);
      relations = relations.map(relation => relation.tagName === oldName && relation.userId === userId
        ? { ...relation, tagName: newName } : relation);
    },
    dropTag: async (tagName: string, userId: string) => {
      tags = tags.filter(tag => tag.display_name !== tagName || tag.userId !== userId);
      relations = relations.filter(relation => relation.tagName !== tagName || relation.userId !== userId);
    },
    createTagRelation: async (tagName: string, avatarId: string, userId: string) => {
      relations = [...relations, { tagName, avatarId, userId }];
    },
    countTagRelationsOf: async (tagName: string, userId: string) =>
      relations.filter(relation => relation.tagName === tagName && relation.userId === userId).length,
    dropTagRelation: async (tagName: string, avatarId: string, userId: string) => {
      relations = relations.filter(relation =>
        relation.tagName !== tagName || relation.avatarId !== avatarId || relation.userId !== userId);
    },
    fetchAvatarsTags: async (avatarIds: Array<string>, userId: string): Promise<Record<string, Array<Tag>>> =>
      Object.fromEntries(avatarIds.flatMap(avatarId => {
        const names = relations.filter(relation => relation.avatarId === avatarId && relation.userId === userId)
          .map(relation => relation.tagName);
        const assigned = tags.filter(tag => tag.userId === userId && names.includes(tag.display_name))
          .map(({ display_name, color }) => ({ display_name, color }));
        return assigned.length > 0 ? [[avatarId, assigned]] : [];
      })),
  };
};

export type TestTagStore = ReturnType<typeof createTestTagStore>;

export const createTagStoreProxy = (store: () => TestTagStore) => ({
  createTag: (...args: Parameters<TestTagStore['createTag']>) => store().createTag(...args),
  queryTagExists: (...args: Parameters<TestTagStore['queryTagExists']>) => store().queryTagExists(...args),
  queryAllTagsAvailable: (...args: Parameters<TestTagStore['queryAllTagsAvailable']>) => store().queryAllTagsAvailable(...args),
  updateTag: (...args: Parameters<TestTagStore['updateTag']>) => store().updateTag(...args),
  dropTag: (...args: Parameters<TestTagStore['dropTag']>) => store().dropTag(...args),
  createTagRelation: (...args: Parameters<TestTagStore['createTagRelation']>) => store().createTagRelation(...args),
  countTagRelationsOf: (...args: Parameters<TestTagStore['countTagRelationsOf']>) => store().countTagRelationsOf(...args),
  dropTagRelation: (...args: Parameters<TestTagStore['dropTagRelation']>) => store().dropTagRelation(...args),
  fetchAvatarsTags: (...args: Parameters<TestTagStore['fetchAvatarsTags']>) => store().fetchAvatarsTags(...args),
});
