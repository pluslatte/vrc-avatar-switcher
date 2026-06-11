import { notifications } from '@mantine/notifications';
import { renderHook, waitFor } from '@testing-library/react';
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
  { id: 'avtr_1', name: 'アバター1', imageUrl: '', thumbnailImageUrl: '' },
  { id: 'avtr_2', name: 'アバター2', imageUrl: '', thumbnailImageUrl: '' },
];

const makeUser = (currentAvatar: string): CurrentUser => ({
  id: 'usr_aaaa',
  displayName: 'Alice',
  currentAvatar,
  currentAvatarThumbnailImageUrl: '',
});

describe('useSwitchAvatarMutation', () => {
  it('切替に成功すると着用中アバターが再フェッチなしで更新され成功通知が出る (C1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const newUser = makeUser('avtr_2');
    vi.mocked(command_switch_avatar).mockResolvedValue(newUser);

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      queryKeys.avatarList('Updated'),
      { avatars, currentUser: makeUser('avtr_1') },
    );

    const { result } = renderHook(() => useSwitchAvatarMutation('Updated'), {
      wrapper: createQueryWrapper(queryClient),
    });
    result.current.mutate('avtr_2');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // TanStack Query は mutationFn に第 2 引数（context）も渡すため、第 1 引数のみ検証する
    expect(vi.mocked(command_switch_avatar).mock.calls[0][0]).toBe('avtr_2');
    // アバター一覧はそのままに currentUser だけ差し替わる
    expect(queryClient.getQueryData(queryKeys.avatarList('Updated')))
      .toEqual({ avatars, currentUser: newUser });
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      message: 'アバターの切り替えに成功しました',
      color: 'green',
    }));
  });

  it('切替に失敗するとエラー内容つきの通知が出てキャッシュは変わらない (C2)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    // Tauri コマンドは string で reject する
    vi.mocked(command_switch_avatar).mockRejectedValue('avatar is not available');

    const queryClient = createTestQueryClient();
    const before = { avatars, currentUser: makeUser('avtr_1') };
    queryClient.setQueryData(queryKeys.avatarList('Updated'), before);

    const { result } = renderHook(() => useSwitchAvatarMutation('Updated'), {
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
