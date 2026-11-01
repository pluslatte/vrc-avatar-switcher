import { invoke } from '@tauri-apps/api/core';
import {
  countTagRelationsOf, createTag, createTagRelation, dropTag, dropTagRelation,
  fetchAvatarsTags, queryAllTagsAvailable, queryClientConfig, queryTagExists,
  updateClientConfig, updateTag,
} from './index';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

beforeEach(() => vi.mocked(invoke).mockReset());

it.each([
  { call: () => createTag('Tag', 'user', 'red'), command: 'command_create_tag', args: { tagName: 'Tag', currentUserId: 'user', color: 'red' }, value: undefined },
  { call: () => queryTagExists('Tag', 'user'), command: 'command_query_tag_exists', args: { tagName: 'Tag', currentUserId: 'user' }, value: true },
  { call: () => queryAllTagsAvailable('user'), command: 'command_query_all_tags_available', args: { currentUserId: 'user' }, value: [{ display_name: 'Tag', color: 'red' }] },
  { call: () => dropTag('Tag', 'user'), command: 'command_drop_tag', args: { tagName: 'Tag', currentUserId: 'user' }, value: undefined },
  { call: () => updateTag('Old', 'New', 'red', 'user'), command: 'command_update_tag', args: { oldTagName: 'Old', newTagName: 'New', newColor: 'red', currentUserId: 'user' }, value: undefined },
  { call: () => createTagRelation('Tag', 'avatar', 'user'), command: 'command_create_tag_relation', args: { tagName: 'Tag', avatarId: 'avatar', currentUserId: 'user' }, value: undefined },
  { call: () => countTagRelationsOf('Tag', 'user'), command: 'command_count_tag_relations_of', args: { tagName: 'Tag', currentUserId: 'user' }, value: 2 },
  { call: () => dropTagRelation('Tag', 'avatar', 'user'), command: 'command_drop_tag_relation', args: { tagName: 'Tag', avatarId: 'avatar', currentUserId: 'user' }, value: undefined },
  { call: () => fetchAvatarsTags(['avatar'], 'user'), command: 'command_fetch_avatars_tags', args: { avatarIds: ['avatar'], currentUserId: 'user' }, value: { avatar: [{ display_name: 'Tag', color: 'red' }] } },
  { call: () => fetchAvatarsTags([], 'user'), command: 'command_fetch_avatars_tags', args: { avatarIds: [], currentUserId: 'user' }, value: {} },
  { call: () => queryClientConfig('key'), command: 'command_query_client_config', args: { key: 'key' }, value: 'value' },
  { call: () => updateClientConfig('key', 'value'), command: 'command_update_client_config', args: { key: 'key', value: 'value' }, value: undefined },
])('$command sends its arguments and returns its result', async ({ call, command, args, value }) => {
  vi.mocked(invoke).mockResolvedValueOnce(value);
  await expect(call()).resolves.toEqual(value);
  expect(invoke).toHaveBeenCalledExactlyOnceWith(command, args);
});

it('localizes duplicate tag errors from Rust', async () => {
  vi.mocked(invoke).mockRejectedValueOnce({ kind: 'DuplicateTag', message: 'Tag' });
  await expect(createTag('Tag', 'user', 'red')).rejects.toThrow('タグ名「Tag」は既に存在します');
});

it('preserves database errors from Rust', async () => {
  vi.mocked(invoke).mockRejectedValueOnce({ kind: 'Database', message: 'database is locked' });
  await expect(queryAllTagsAvailable('user')).rejects.toThrow('database is locked');
});

it('preserves command dispatch errors from Tauri', async () => {
  vi.mocked(invoke).mockRejectedValueOnce('Command not found');
  await expect(queryAllTagsAvailable('user')).rejects.toThrow('Command not found');
});
