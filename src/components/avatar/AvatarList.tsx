import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { useAvatarList } from '@/hooks/useAvatarList';

const AvatarList = () => {
  const { avatarListQuery, handlerAvatarSwitch } = useAvatarList();

  if (avatarListQuery.isPending) return <div>Loading...</div>;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;

  return (
    <Grid>
      {avatarListQuery.data.avatars.map(avatar => (
        <Grid.Col span={3} key={avatar.id}>
          {avatarListQuery.data.currentUser.currentAvatar === avatar.id && (
            <Indicator
              processing
              color="green"
              size={16}
              offset={16}
              position="top-start"
            >
              <AvatarCard
                avatar={avatar}
                isActive={avatarListQuery.data.currentUser.currentAvatar === avatar.id}
                onAvatarSwitchClicked={handlerAvatarSwitch}
              />
            </Indicator>)}
          {avatarListQuery.data.currentUser.currentAvatar !== avatar.id && (
            <AvatarCard
              avatar={avatar}
              isActive={avatarListQuery.data.currentUser.currentAvatar === avatar.id}
              onAvatarSwitchClicked={handlerAvatarSwitch}
            />)}
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default AvatarList;