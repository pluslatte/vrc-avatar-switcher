import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, fetchAvatarsTags, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import type { Tag } from '@/lib/models';
import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useTagManager } from './useTagManager';

vi.mock('@/lib/db/client', () => ({
  getDb: async () => db,
}));

let db: TestDb;
const userA = 'usr_aaaa';

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

const renderTagManager = (params: {
  avatarIds: Array<string>;
  tagAvatarRelation?: Record<string, Array<Tag>>;
}) =>
  renderHook(
    () => useTagManager({
      avatarIds: params.avatarIds,
      currentUserId: userA,
      tagAvatarRelation: params.tagAvatarRelation ?? {},
    }),
    { wrapper: createQueryWrapper(createTestQueryClient()) },
  );

describe('useTagManager', () => {
  it('recovers after a tag lookup fails and permits another assignment', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const { result } = renderTagManager({ avatarIds: ['avtr_1'] });
    await waitFor(() => expect(result.current.tagsAvailableQuery.isSuccess).toBe(true));
    vi.spyOn(db, 'select').mockRejectedValueOnce(new Error('Lookup unavailable'));

    act(() => result.current.handleExistingTagClick('Favorite', '#ff0000'));
    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Lookup unavailable'),
      color: 'red',
    })));
    expect(result.current.isRegistering).toBe(false);

    act(() => result.current.handleExistingTagClick('Favorite', '#ff0000'));
    await waitFor(async () => expect(await countTagRelationsOf('Favorite', userA)).toBe(1));
  });

  it('creates a tag with the chosen name and color and assigns it to every target avatar (E1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const { result } = renderTagManager({ avatarIds: ['avtr_1', 'avtr_2'] });

    act(() => {
      result.current.setNewTagName('New tag');
      result.current.setNewTagColor('#ff0000');
    });
    act(() => {
      result.current.handleCreateNewTag();
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('New tag', userA)).toBe(2);
    });
    expect(await queryAllTagsAvailable(userA)).toEqual([
      { display_name: 'New tag', color: '#ff0000' },
    ]);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ追加',
      message: 'タグ「New tag」を2件のアバターに追加しました。',
    }));
    await waitFor(() => expect(result.current.newTagName).toBe(''));
  });

  it('assigns an existing tag without creating it again (E2)', async () => {
    await createTag('Existing tag', userA, '#00ff00');
    const { result } = renderTagManager({ avatarIds: ['avtr_1', 'avtr_2'] });

    act(() => {
      result.current.handleExistingTagClick('Existing tag', '#00ff00');
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('Existing tag', userA)).toBe(2);
    });
    expect(await queryAllTagsAvailable(userA)).toHaveLength(1);
  });

  it('only warns when every target avatar already has the tag (E3)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const tag: Tag = { display_name: 'Assigned', color: '#ff0000' };
    await createTag('Assigned', userA, '#ff0000');
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: { avtr_1: [tag], avtr_2: [tag] },
    });

    act(() => {
      result.current.handleExistingTagClick('Assigned', '#ff0000');
    });

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ追加',
      message: 'タグ「Assigned」は対象のアバターにすでに割り当て済みです。',
      color: 'yellow',
    })));
    expect(await countTagRelationsOf('Assigned', userA)).toBe(0);
  });

  it('assigns the tag only to avatars that do not already have it (E4)', async () => {
    const tag: Tag = { display_name: 'Partially assigned', color: '#ff0000' };
    await createTag('Partially assigned', userA, '#ff0000');
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: { avtr_1: [tag] },
    });

    act(() => {
      result.current.handleExistingTagClick('Partially assigned', '#ff0000');
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('Partially assigned', userA)).toBe(1);
    });
    const relations = await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA);
    expect(relations['avtr_2']).toEqual([tag]);
  });

  it('does not create a tag when the trimmed name is empty (E6)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const { result } = renderTagManager({ avatarIds: ['avtr_1'] });

    act(() => {
      result.current.setNewTagName('   ');
    });
    act(() => {
      result.current.handleCreateNewTag();
    });

    expect(showSpy).not.toHaveBeenCalled();
    expect(await queryTagExists('   ', userA)).toBe(false);
  });

  it('disables only tags shared by every selected avatar', () => {
    const tagX: Tag = { display_name: 'X', color: '#111111' };
    const tagY: Tag = { display_name: 'Y', color: '#222222' };
    const tagZ: Tag = { display_name: 'Z', color: '#333333' };
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: {
        avtr_1: [tagX, tagY],
        avtr_2: [tagY, tagZ],
      },
    });

    expect(result.current.disabledTagNames).toEqual(['Y']);
  });
});
