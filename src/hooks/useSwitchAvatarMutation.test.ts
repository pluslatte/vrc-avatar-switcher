import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { command_switch_avatar } from '@/lib/commands';
import { Avatar, CurrentUser } from '@/lib/models';
import { queryKeys } from '@/lib/queryKeys';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useSwitchAvatarMutation } from './useSwitchAvatarMutation';

vi.mock('@/lib/commands');

beforeEach(() => {
  vi.clearAllMocks();
});

const avatars: Array<Avatar> = [
  { id: 'avtr_1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
  { id: 'avtr_2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
];

const makeUser = (currentAvatar: string): CurrentUser => ({
  id: 'usr_aaaa',
  displayName: 'Alice',
  currentAvatar,
  currentAvatarThumbnailImageUrl: '',
});

describe('useSwitchAvatarMutation', () => {
  it('updates every cached sort order without creating incomplete entries', async () => {
    const queryClient = createTestQueryClient();
    const newUser = makeUser('avtr_2');
    vi.mocked(command_switch_avatar).mockResolvedValue(newUser);
    queryClient.setQueryData(queryKeys.avatarList('Name'), { avatars, currentUser: makeUser('avtr_1') });
    queryClient.setQueryData(queryKeys.avatarList('Updated'), { avatars: [...avatars].reverse(), currentUser: makeUser('avtr_1') });
    const { result } = renderHook(() => useSwitchAvatarMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await act(async () => { await result.current.mutateAsync('avtr_2'); });

    expect(queryClient.getQueryData(queryKeys.avatarList('Name'))).toEqual({ avatars, currentUser: newUser });
    expect(queryClient.getQueryData(queryKeys.avatarList('Updated'))).toEqual({ avatars: [...avatars].reverse(), currentUser: newUser });
    expect(queryClient.getQueryData(queryKeys.avatarList(undefined))).toBeUndefined();
  });

  it('updates the current avatar without refetching and shows a success notification (C1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const newUser = makeUser('avtr_2');
    vi.mocked(command_switch_avatar).mockResolvedValue(newUser);

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.avatarList('Updated'),
      { avatars, currentUser: makeUser('avtr_1') },
    );

    const { result } = renderHook(() => useSwitchAvatarMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });
    result.current.mutate('avtr_2');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(command_switch_avatar).mock.calls[0][0]).toBe('avtr_2');
    expect(queryClient.getQueryData(queryKeys.avatarList('Updated')))
      .toEqual({ avatars, currentUser: newUser });
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'アバターの切り替えに成功しました',
      color: 'green',
    }));
  });

  it('shows the error and preserves the cache when switching fails (C2)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    vi.mocked(command_switch_avatar).mockRejectedValue('avatar is not available');

    const queryClient = createTestQueryClient();
    const before = { avatars, currentUser: makeUser('avtr_1') };
    queryClient.setQueryData(queryKeys.avatarList('Updated'), before);

    const { result } = renderHook(() => useSwitchAvatarMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });
    result.current.mutate('avtr_2');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(queryKeys.avatarList('Updated'))).toEqual(before);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'アバターの切り替えに失敗しました: avatar is not available',
      color: 'red',
    }));
  });
});
