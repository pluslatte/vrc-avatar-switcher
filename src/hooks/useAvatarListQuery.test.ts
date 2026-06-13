import { notifications } from '@mantine/notifications';
import { renderHook, waitFor } from '@testing-library/react';
import { command_fetch_avatars, command_fetch_current_user } from '@/lib/commands';
import { Avatar, CurrentUser } from '@/lib/models';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useAvatarListQuery } from './useAvatarListQuery';

vi.mock('@/lib/commands');

beforeEach(() => {
  vi.clearAllMocks();
});

const avatars: Array<Avatar> = [
  { id: 'avtr_1', name: 'アバター1', imageUrl: '', thumbnailImageUrl: '' },
  { id: 'avtr_2', name: 'アバター2', imageUrl: '', thumbnailImageUrl: '' },
];

const currentUser: CurrentUser = {
  id: 'usr_aaaa',
  displayName: 'Alice',
  currentAvatar: 'avtr_1',
  currentAvatarThumbnailImageUrl: '',
};

describe('useAvatarListQuery', () => {
  it('選択中のソート順でアバター一覧と現在のユーザーを取得する (B1, B2)', async () => {
    vi.mocked(command_fetch_avatars).mockResolvedValue(avatars);
    vi.mocked(command_fetch_current_user).mockResolvedValue(currentUser);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Name'), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ avatars, currentUser });
    expect(command_fetch_avatars).toHaveBeenCalledWith('Name');
  });

  it('ソート順設定がロードされるまでフェッチしない', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery(undefined), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(command_fetch_avatars).not.toHaveBeenCalled();
  });

  it('enabled が false なら（未認証時）フェッチしない', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Name', false), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(command_fetch_avatars).not.toHaveBeenCalled();
    expect(command_fetch_current_user).not.toHaveBeenCalled();
  });

  it('取得に失敗するとエラー通知が表示されクエリはエラーになる (B4)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    // Tauri コマンドは string で reject する
    vi.mocked(command_fetch_avatars).mockRejectedValue('VRChat API unavailable');
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Updated'), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'アバターの読み込みに失敗しました',
      message: 'VRChat API unavailable',
      color: 'red',
    }));
  });
});
