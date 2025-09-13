import { command_fetch_avatars, command_fetch_current_user, command_switch_avatar } from '@/lib/commands';
import { Avatar, CurrentUser } from '@/lib/models';
import { loadCookies } from '@/lib/stores';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AvatarListQuery {
  avatars: Array<Avatar>,
  currentUser: CurrentUser,
}
export const useAvatarList = () => {
  const queryClient = useQueryClient();

  const avatarListQuery = useQuery<AvatarListQuery>({
    queryKey: ['avatarList'], queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      return {
        avatars: await command_fetch_avatars(authCookie, twofaCookie),
        currentUser: await command_fetch_current_user(authCookie, twofaCookie),
      };
    }
  });

  const switchAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      const { authCookie, twofaCookie } = await loadCookies();
      return await command_switch_avatar(authCookie, twofaCookie, avatarId);
    },
    onSuccess: (currentUser) => {
      queryClient.setQueryData(['avatarList'], (oldData: AvatarListQuery) => ({
        ...oldData,
        currentUser
      }));
    }
  });

  const handlerAvatarSwitch = (avatarId: string) => {
    switchAvatarMutation.mutate(avatarId);
  };

  return { avatarListQuery, handlerAvatarSwitch };
};