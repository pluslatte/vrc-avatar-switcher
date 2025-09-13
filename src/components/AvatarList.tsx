import { command_fetch_avatars } from '@/lib/commands';
import { loadCookies } from '@/lib/stores';
import { useQuery } from '@tanstack/react-query';

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
      <ul>
        {query.data.map(avatar => (
          <li key={avatar.id}>
            <img src={avatar.thumbnailImageUrl} alt={avatar.name} />
            <p>{avatar.name}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
};

export default AvatarList;