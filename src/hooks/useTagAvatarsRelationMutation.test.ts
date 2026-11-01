import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, createTagRelation, queryTagExists } from '@/lib/db';
import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useTagAvatarsRelationMutation } from './useTagAvatarsRelationMutation';

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

describe('useTagAvatarsRelationMutation', () => {
  it('deletes the tag and shows a notification after removing its last assignment (F5)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Orphaned tag', userA, '#ff0000');
    await createTagRelation('Orphaned tag', 'avtr_1', userA);

    const { result } = renderHook(() => useTagAvatarsRelationMutation(), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });
    act(() => {
      result.current.removeTagAvatarsRelation({
        tagName: 'Orphaned tag',
        avatarId: 'avtr_1',
        currentUserId: userA,
      });
    });

    await waitFor(async () => {
      expect(await queryTagExists('Orphaned tag', userA)).toBe(false);
    });
    expect(await countTagRelationsOf('Orphaned tag', userA)).toBe(0);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「Orphaned tag」は他に関連付けられたアバターがないため削除されました',
    }));
  });

  it('keeps the tag when other avatars still use it (F6)', async () => {
    await createTag('Remaining tag', userA, '#ff0000');
    await createTagRelation('Remaining tag', 'avtr_1', userA);
    await createTagRelation('Remaining tag', 'avtr_2', userA);

    const { result } = renderHook(() => useTagAvatarsRelationMutation(), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });
    act(() => {
      result.current.removeTagAvatarsRelation({
        tagName: 'Remaining tag',
        avatarId: 'avtr_1',
        currentUserId: userA,
      });
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('Remaining tag', userA)).toBe(1);
    });
    expect(await queryTagExists('Remaining tag', userA)).toBe(true);
  });
});
