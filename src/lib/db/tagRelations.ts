import { Tag } from '@/lib/models';
import { invokeDatabaseCommand } from './client';

export const createTagRelation = (
  tagName: string,
  avatarId: string,
  currentUserId: string,
): Promise<void> =>
  invokeDatabaseCommand('command_create_tag_relation', { tagName, avatarId, currentUserId });

export const countTagRelationsOf = (tagName: string, currentUserId: string): Promise<number> =>
  invokeDatabaseCommand('command_count_tag_relations_of', { tagName, currentUserId });

export const dropTagRelation = (
  tagName: string,
  avatarId: string,
  currentUserId: string,
): Promise<void> =>
  invokeDatabaseCommand('command_drop_tag_relation', { tagName, avatarId, currentUserId });

export const fetchAvatarsTags = (
  avatarIds: Array<string>,
  currentUserId: string,
): Promise<Record<string, Array<Tag>>> =>
  invokeDatabaseCommand('command_fetch_avatars_tags', { avatarIds, currentUserId });
