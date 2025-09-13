import { command_fetch_avatars, command_fetch_current_user, command_switch_avatar } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import { Grid } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';

interface AvatarListQuery {
  avatars: Array<Avatar>,
  currentUser: CurrentUser,
}
const AvatarList = () => {
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

  return (<div>
    {avatarListQuery.isPending && <div>Loading...</div>}
    {avatarListQuery.isError && <div>Error: {(avatarListQuery.error as Error).message}</div>}
    {avatarListQuery.data && (
      <Grid>
        {avatarListQuery.data.avatars.map(avatar => (
          <Grid.Col span={3} key={avatar.id}>
            <AvatarCard
              avatar={avatar}
              isActive={avatarListQuery.data.currentUser.currentAvatar === avatar.id}
              onAvatarSwitchClicked={handlerAvatarSwitch}
            />
          </Grid.Col>
        ))}
      </Grid>
    )}
  </div>
  );
};

export default AvatarList;