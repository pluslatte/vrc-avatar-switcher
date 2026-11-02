import { Tag } from '@/lib/models';
import { invokeDatabaseCommand } from './client';

export const createTag = (tagName: string, currentUserId: string, color: string): Promise<void> =>
  invokeDatabaseCommand('command_create_tag', { tagName, currentUserId, color });

export const queryTagExists = (tagName: string, currentUserId: string): Promise<boolean> =>
  invokeDatabaseCommand('command_query_tag_exists', { tagName, currentUserId });

export const queryAllTagsAvailable = (currentUserId: string): Promise<Array<Tag>> =>
  invokeDatabaseCommand('command_query_all_tags_available', { currentUserId });

export const dropTag = (tagName: string, currentUserId: string): Promise<void> =>
  invokeDatabaseCommand('command_drop_tag', { tagName, currentUserId });

export const updateTag = (
  oldTagName: string,
  newTagName: string,
  newColor: string,
  currentUserId: string,
): Promise<void> =>
  invokeDatabaseCommand('command_update_tag', { oldTagName, newTagName, newColor, currentUserId });
