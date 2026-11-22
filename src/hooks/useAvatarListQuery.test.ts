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
  { id: 'avtr_1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
  { id: 'avtr_2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
];

const currentUser: CurrentUser = {
  id: 'usr_aaaa',
  displayName: 'Alice',
  currentAvatar: 'avtr_1',
  currentAvatarThumbnailImageUrl: '',
};

describe('useAvatarListQuery', () => {
  it('fetches avatars in the selected sort order and the current user (B1, B2)', async () => {
    vi.mocked(command_fetch_avatars).mockResolvedValue(avatars);
    vi.mocked(command_fetch_current_user).mockResolvedValue(currentUser);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Name', true), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ avatars, currentUser });
    expect(command_fetch_avatars).toHaveBeenCalledWith('Name');
  });

  it('waits for the sort order setting before fetching', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery(undefined, true), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(command_fetch_avatars).not.toHaveBeenCalled();
  });

  it('does not fetch when disabled for an unauthenticated session', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Name', false), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(command_fetch_avatars).not.toHaveBeenCalled();
    expect(command_fetch_current_user).not.toHaveBeenCalled();
  });

  it('shows an error notification when the query fails (B4)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    vi.mocked(command_fetch_avatars).mockRejectedValue('VRChat API unavailable');
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useAvatarListQuery('Updated', true), {
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
