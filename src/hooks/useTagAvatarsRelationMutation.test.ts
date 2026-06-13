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
  it('最後の 1 件の関連付けを外すとタグ自体も自動削除され通知される (F5)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('孤立するタグ', userA, '#ff0000');
    await createTagRelation('孤立するタグ', 'avtr_1', userA);

    const { result } = renderHook(() => useTagAvatarsRelationMutation(), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });
    act(() => {
      result.current.removeTagAvatarsRelation({
        tagName: '孤立するタグ',
        avatarId: 'avtr_1',
        currentUserId: userA,
      });
    });

    await waitFor(async () => {
      expect(await queryTagExists('孤立するタグ', userA)).toBe(false);
    });
    expect(await countTagRelationsOf('孤立するタグ', userA)).toBe(0);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「孤立するタグ」は他に関連付けられたアバターがないため削除されました',
    }));
  });

  it('他のアバターに関連付けが残っていればタグは削除されない (F6)', async () => {
    await createTag('残るタグ', userA, '#ff0000');
    await createTagRelation('残るタグ', 'avtr_1', userA);
    await createTagRelation('残るタグ', 'avtr_2', userA);

    const { result } = renderHook(() => useTagAvatarsRelationMutation(), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });
    act(() => {
      result.current.removeTagAvatarsRelation({
        tagName: '残るタグ',
        avatarId: 'avtr_1',
        currentUserId: userA,
      });
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('残るタグ', userA)).toBe(1);
    });
    expect(await queryTagExists('残るタグ', userA)).toBe(true);
  });
});
