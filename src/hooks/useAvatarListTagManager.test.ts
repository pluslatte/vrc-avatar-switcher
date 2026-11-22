import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, createTagRelation, queryTagExists } from '@/lib/db';
import type { Avatar } from '@/lib/models';
import { createTestTagStore, type TestTagStore } from '@/test/tagStore';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useAvatarListTagManager } from './useAvatarListTagManager';

vi.mock('@/lib/db', async () => {
  const { createTagStoreProxy } = await import('@/test/tagStore');
  return createTagStoreProxy(() => db);
});

let db: TestTagStore;
const userA = 'usr_aaaa';

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestTagStore();
});

const makeAvatar = (id: string): Avatar => ({
  id,
  name: id,
  imageUrl: '',
  thumbnailImageUrl: '',
});

const threeAvatars = [makeAvatar('avtr_1'), makeAvatar('avtr_2'), makeAvatar('avtr_3')];

const renderManager = (filteredAvatars: Array<Avatar>) =>
  renderHook(
    (props: { filteredAvatars: Array<Avatar> }) =>
      useAvatarListTagManager({ filteredAvatars: props.filteredAvatars, currentUserId: userA }),
    {
      initialProps: { filteredAvatars },
      wrapper: createQueryWrapper(createTestQueryClient()),
    },
  );

describe('useAvatarListTagManager', () => {
  it('selects individual avatars and updates the count and indeterminate state (G1)', () => {
    const { result } = renderManager(threeAvatars);

    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1']);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.indeterminate).toBe(true);
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1']);

    act(() => result.current.handleAvatarSelectionChange('avtr_1', false));
    expect(result.current.selectedAvatarIds).toEqual([]);
    expect(result.current.indeterminate).toBe(false);
  });

  it('selects all visible avatars and clears the selection (G2)', () => {
    const { result } = renderManager(threeAvatars);

    act(() => result.current.handleSelectAllToggle(true));
    expect(result.current.selectedAvatarIds).toEqual(['avtr_1', 'avtr_2', 'avtr_3']);
    expect(result.current.allSelected).toBe(true);
    expect(result.current.indeterminate).toBe(false);

    act(() => result.current.handleSelectAllToggle(false));
    expect(result.current.selectedAvatarIds).toEqual([]);
  });

  it('removes hidden avatars from the selection when filters change (G3)', async () => {
    const { result, rerender } = renderManager(threeAvatars);

    act(() => {
      result.current.handleAvatarSelectionChange('avtr_1', true);
      result.current.handleAvatarSelectionChange('avtr_2', true);
    });
    expect(result.current.selectedCount).toBe(2);

    rerender({ filteredAvatars: [makeAvatar('avtr_1')] });

    await waitFor(() => expect(result.current.selectedAvatarIds).toEqual(['avtr_1']));
  });

  it('closes the bulk tag dialog when the selection becomes empty (G4)', async () => {
    const { result } = renderManager(threeAvatars);

    act(() => result.current.handleAvatarSelectionChange('avtr_1', true));
    act(() => result.current.openBulkDialog());
    expect(result.current.isBulkDialogOpen).toBe(true);

    act(() => result.current.clearSelection());

    await waitFor(() => expect(result.current.isBulkDialogOpen).toBe(false));
  });

  it('removes a tag from all selected avatars and deletes it after the last assignment (G6)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    await createTag('Bulk removal', userA, '#ff0000');
    await createTagRelation('Bulk removal', 'avtr_1', userA);
    await createTagRelation('Bulk removal', 'avtr_2', userA);

    const { result } = renderManager(threeAvatars);
    act(() => {
      result.current.handleAvatarSelectionChange('avtr_1', true);
      result.current.handleAvatarSelectionChange('avtr_2', true);
    });

    await act(async () => {
      await result.current.handleBulkTagRemove('Bulk removal');
    });

    expect(await countTagRelationsOf('Bulk removal', userA)).toBe(0);
    expect(await queryTagExists('Bulk removal', userA)).toBe(false);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ削除',
      message: 'タグ「Bulk removal」を選択中のアバターから削除しました。',
    }));
  });
});
