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

const renderDialog = (onCloseSuper: () => void = vi.fn()) =>
  renderHook(() => useTagEditDialog(onCloseSuper, userA), {
    wrapper: createQueryWrapper(createTestQueryClient()),
  });

describe('useTagEditDialog', () => {
  it('タグ名と色を変更して保存でき、フォームがリセットされる (F1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('旧名', userA, '#ff0000');
    const { result } = renderDialog();

    act(() => {
      result.current.setSelectedTag({ display_name: '旧名', color: '#ff0000' });
      result.current.setTagDisplayName('新名');
      result.current.setColor('#00ff00');
    });
    act(() => {
      result.current.handleSave();
    });

    await waitFor(async () => {
      expect(await queryAllTagsAvailable(userA)).toEqual([
        { display_name: '新名', color: '#00ff00' },
      ]);
    });
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: '成功',
      color: 'green',
    }));
    await waitFor(() => expect(result.current.selectedTag).toBeNull());
  });

  it('既存タグ名へのリネームはエラー通知になり保存されない (F2)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('タグ1', userA, '#ff0000');
    await createTag('タグ2', userA, '#00ff00');
    const { result } = renderDialog();

    act(() => {
      result.current.setSelectedTag({ display_name: 'タグ1', color: '#ff0000' });
      result.current.setTagDisplayName('タグ2');
    });
    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'エラー',
      message: 'タグ「タグ1」の更新に失敗しました: タグ名「タグ2」は既に存在します',
      color: 'red',
    })));
    expect(await queryTagExists('タグ1', userA)).toBe(true);
  });

  it('タグ名を空にして保存しようとするとエラー通知が出る (F3)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('タグ1', userA, '#ff0000');
    const { result } = renderDialog();

    act(() => {
      result.current.setSelectedTag({ display_name: 'タグ1', color: '#ff0000' });
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
    // タグは変更されていない
    expect(await queryTagExists('タグ1', userA)).toBe(true);
  });

  it('タグを削除すると全アバターからの関連付けも消えて通知される (F4)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('消すタグ', userA, '#ff0000');
    await createTagRelation('消すタグ', 'avtr_1', userA);
    await createTagRelation('消すタグ', 'avtr_2', userA);
    const { result } = renderDialog();

    act(() => {
      result.current.setSelectedTag({ display_name: '消すタグ', color: '#ff0000' });
    });
    act(() => {
      result.current.handleDelete();
    });

    await waitFor(async () => {
      expect(await queryTagExists('消すタグ', userA)).toBe(false);
    });
    expect(await countTagRelationsOf('消すタグ', userA)).toBe(0);
    expect(await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA)).toEqual({});
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「消すタグ」を削除しました（関連付けられたアバターからも削除されました）',
    }));
  });

  it('onClose でフォームがリセットされ親のクローズ処理が呼ばれる', () => {
    const onCloseSuper = vi.fn();
    const { result } = renderDialog(onCloseSuper);

    act(() => {
      result.current.setSelectedTag({ display_name: 'タグ1', color: '#ff0000' });
      result.current.setTagDisplayName('編集中');
    });
    act(() => {
      result.current.onClose();
    });

    expect(onCloseSuper).toHaveBeenCalledTimes(1);
    expect(result.current.selectedTag).toBeNull();
    expect(result.current.tagDisplayName).toBe('');
  });
});
