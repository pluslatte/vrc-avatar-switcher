import { act, renderHook, waitFor } from '@testing-library/react';
import { AvatarTags } from '@/lib/avatarTags';
import { usePendingAvatarTags } from './usePendingAvatarTags';

const tag = { display_name: 'Favorite', color: '#ff0000' };

describe('usePendingAvatarTags', () => {
  it('keeps new assignments visible until refreshed relations arrive', async () => {
    const { result, rerender } = renderHook(
      (relations: AvatarTags) => usePendingAvatarTags(relations),
      { initialProps: {} as AvatarTags },
    );
    act(() => result.current.addPendingTag(['avatar'], tag));
    expect(result.current.tagsOfAvatar('avatar')).toEqual([tag]);

    rerender({ avatar: [tag] });
    await waitFor(() => expect(result.current.tagsOfAvatar('avatar')).toEqual([tag]));
    rerender({});
    await waitFor(() => expect(result.current.tagsOfAvatar('avatar')).toEqual([]));
  });

  it('preserves pending assignments for avatars absent from a refresh', () => {
    const { result, rerender } = renderHook(
      (relations: AvatarTags) => usePendingAvatarTags(relations),
      { initialProps: {} as AvatarTags },
    );
    act(() => result.current.addPendingTag(['first', 'second'], tag));
    rerender({ first: [tag] });
    expect(result.current.tagsOfAvatar('first')).toEqual([tag]);
    expect(result.current.tagsOfAvatar('second')).toEqual([tag]);
  });
});
