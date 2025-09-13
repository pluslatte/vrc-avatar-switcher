import { command_fetch_avatars, command_fetch_current_user } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import { Grid } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import AvatarCard from './AvatarCard';

const AvatarList = () => {
  const query = useQuery({
    queryKey: ['avatars'], queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      return {
        avatars: await command_fetch_avatars(authCookie, twofaCookie),
        currentUser: await command_fetch_current_user(authCookie, twofaCookie),
      };
    }
  });

  return (<div>
    {query.isPending && <div>Loading...</div>}
    {query.isError && <div>Error: {(query.error as Error).message}</div>}
    {query.data && (
      <Grid>
        {query.data.avatars.map(avatar => (
          <Grid.Col span={3} key={avatar.id}>
            <AvatarCard avatar={avatar} isActive={query.data.currentUser.currentAvatar === avatar.id} />
          </Grid.Col>
        ))}
      </Grid>
    )}
  </div>
  );
};

export default AvatarList;