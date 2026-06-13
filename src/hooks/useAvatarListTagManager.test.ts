import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, createTagRelation, queryTagExists } from '@/lib/db';
import type { Avatar } from '@/lib/models';
import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useAvatarListTagManager } from './useAvatarListTagManager';

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

const makeAvatar = (id: string): Avatar => ({
  id,
  name: id,
  imageUrl: '',
  thumbnailImageUrl: '',
});

const threeAvatars = [makeAvatar('avtr_1'), makeAvatar('avtr_2'), makeAvatar('avtr_3')];

const renderManager = (filteredAvatars: Array<Avatar> = threeAvatars) =>
  renderHook(
    (props: { filteredAvatars: Array<Avatar> }) =>
      useAvatarListTagManager({ filteredAvatars: props.filteredAvatars, currentUserId: userA }),
    {
      initialProps: { filteredAvatars },
      wrapper: createQueryWrapper(createTestQueryClient()),
    },
  );

describe('useAvatarListTagManager', () => {
  it('アバターを個別に選択・解除でき、件数と中間状態が反映される (G1)', () => {
    const { result } = renderManager();

    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1']);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.indeterminate).toBe(true);
    expect(result.current.allSelected).toBe(false);

    // 同じアバターを再選択しても重複しない
    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1']);

    act(() => result.current.handleAvatarSelectionChange('avtr_1', false));
    expect(result.current.selectedAvatarIds).toEqual([]);
    expect(result.current.indeterminate).toBe(false);
  });

  it('全選択で表示中の全アバターが選択され、解除で空になる (G2)', () => {
    const { result } = renderManager();

    act(() => result.current.handleSelectAllToggle(true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1', 'avtr_2', 'avtr_3']);
    expect(result.current.allSelected).toBe(true);
    expect(result.current.indeterminate).toBe(false);

    act(() => result.current.handleSelectAllToggle(false));
    expect(result.current.selectedAvatarIds).toEqual([]);
  });

  it('フィルタで非表示になったアバターは選択から自動的に外れる (G3)', async () => {
    const { result, rerender } = renderManager();

    act(() => {
      result.current.handleAvatarSelectionChange('avtr_1', true);
      result.current.handleAvatarSelectionChange('avtr_2', true);
    });
    expect(result.current.selectedCount).toBe(2);

    rerender({ filteredAvatars: [makeAvatar('avtr_1')] });

    await waitFor(() => expect(result.current.selectedAvatarIds).toEqual(['avtr_1']));
  });

  it('選択が 0 件になると一括タグダイアログが自動的に閉じる (G4)', async () => {
    const { result } = renderManager();

    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    act(() => result.current.openBulkDialog());
    expect(result.current.isBulkDialogOpen).toBe(true);

    act(() => result.current.clearSelection());

    await waitFor(() => expect(result.current.isBulkDialogOpen).toBe(false));
  });

  it('選択中の全アバターからタグを一括で外せる（最後の関連ならタグも自動削除）(G6)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('一括削除', userA, '#ff0000');
    await createTagRelation('一括削除', 'avtr_1', userA);
    await createTagRelation('一括削除', 'avtr_2', userA);

    const { result } = renderManager();
    act(() => {
      result.current.handleAvatarSelectionChange('avtr_1', true);
      result.current.handleAvatarSelectionChange('avtr_2', true);
    });

    await act(async () => {
      await result.current.handleBulkTagRemove('一括削除');
    });

    expect(await countTagRelationsOf('一括削除', userA)).toBe(0);
    // 最後の関連付けが消えたのでタグ自体も自動削除される (F5)
    expect(await queryTagExists('一括削除', userA)).toBe(false);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「一括削除」を選択中のアバターから削除しました。',
    }));
  });
});
