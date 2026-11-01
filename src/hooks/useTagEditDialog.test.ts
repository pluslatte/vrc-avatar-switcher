import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, createTagRelation, fetchAvatarsTags, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useTagEditDialog } from './useTagEditDialog';

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

const renderDialog = (onCloseSuper: () => void) =>
  renderHook(() => useTagEditDialog(onCloseSuper, userA), {
    wrapper: createQueryWrapper(createTestQueryClient()),
  });

describe('useTagEditDialog', () => {
  it('saves the new tag name and color and resets the form (F1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Old name', userA, '#ff0000');
    const { result } = renderDialog(vi.fn());

    act(() => {
      result.current.selectTag({ display_name: 'Old name', color: '#ff0000' });
      result.current.setTagDisplayName('New name');
      result.current.setColor('#00ff00');
    });
    act(() => {
      result.current.handleSave();
    });

    await waitFor(async () => {
      expect(await queryAllTagsAvailable(userA)).toEqual([
        { display_name: 'New name', color: '#00ff00' },
      ]);
    });
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: '成功',
      color: 'green',
    }));
    await waitFor(() => expect(result.current.selectedTag).toBeNull());
  });

  it('rejects renaming a tag to an existing name and shows an error (F2)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Tag 1', userA, '#ff0000');
    await createTag('Tag 2', userA, '#00ff00');
    const { result } = renderDialog(vi.fn());

    act(() => {
      result.current.selectTag({ display_name: 'Tag 1', color: '#ff0000' });
      result.current.setTagDisplayName('Tag 2');
    });
    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      message: 'タグ「Tag 1」の更新に失敗しました: タグ名「Tag 2」は既に存在します',
      color: 'red',
    })));
    expect(await queryTagExists('Tag 1', userA)).toBe(true);
  });

  it('shows an error when saving an empty tag name (F3)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Tag 1', userA, '#ff0000');
    const { result } = renderDialog(vi.fn());

    act(() => {
      result.current.selectTag({ display_name: 'Tag 1', color: '#ff0000' });
      result.current.setTagDisplayName('   ');
    });
    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      message: 'タグ名を入力してください',
      color: 'red',
    })));
    expect(await queryTagExists('Tag 1', userA)).toBe(true);
  });

  it('deletes the tag and all its assignments and shows a notification (F4)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Deleted tag', userA, '#ff0000');
    await createTagRelation('Deleted tag', 'avtr_1', userA);
    await createTagRelation('Deleted tag', 'avtr_2', userA);
    const { result } = renderDialog(vi.fn());

    act(() => {
      result.current.selectTag({ display_name: 'Deleted tag', color: '#ff0000' });
    });
    act(() => {
      result.current.handleDelete();
    });

    await waitFor(async () => {
      expect(await queryTagExists('Deleted tag', userA)).toBe(false);
    });
    expect(await countTagRelationsOf('Deleted tag', userA)).toBe(0);
    expect(await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA)).toEqual({});
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「Deleted tag」を削除しました（関連付けられたアバターからも削除されました）',
    }));
  });

  it('resets the form and calls the parent close handler on close', () => {
    const onCloseSuper = vi.fn();
    const { result } = renderDialog(onCloseSuper);

    act(() => {
      result.current.selectTag({ display_name: 'Tag 1', color: '#ff0000' });
      result.current.setTagDisplayName('Editing');
    });
    act(() => {
      result.current.onClose();
    });

    expect(onCloseSuper).toHaveBeenCalledTimes(1);
    expect(result.current.selectedTag).toBeNull();
    expect(result.current.tagDisplayName).toBe('');
  });
});
