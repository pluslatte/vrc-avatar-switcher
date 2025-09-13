import { command_fetch_avatars } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import { Grid } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import AvatarCard from './AvatarCard';

const AvatarList = () => {
  const query = useQuery({
    queryKey: ['avatars'], queryFn: async () => {
      const { authCookie, twofaCookie } = await loadCookies();
      return await command_fetch_avatars(authCookie, twofaCookie);
    }
  });

  return (<div>
    {query.isPending && <div>Loading...</div>}
    {query.isError && <div>Error: {(query.error as Error).message}</div>}
    {query.data && (
      <Grid>
        {query.data.map(avatar => (
          <Grid.Col span={3} key={avatar.id}>
            <AvatarCard avatar={avatar} isActive={true} />
          </Grid.Col>
        ))}
      </Grid>
    )}
  </div>
  );
};

export default AvatarList;