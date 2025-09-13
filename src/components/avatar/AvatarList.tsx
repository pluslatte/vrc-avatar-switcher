import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { useAvatarList } from '@/hooks/useAvatarList';

const AvatarList = () => {
  const { avatarListQuery, handlerAvatarSwitch } = useAvatarList();

  if (avatarListQuery.isPending) return <div>Loading...</div>;
  if (avatarListQuery.isError) return <div>Error: {(avatarListQuery.error as Error).message}</div>;

  return (
    <Grid>
      {avatarListQuery.data.avatars.map(avatar => {
        const isActive = avatarListQuery.data.currentUser.currentAvatar === avatar.id;
        const card = (
          <AvatarCard
            avatar={avatar}
            isActive={isActive}
            onAvatarSwitchClicked={handlerAvatarSwitch}
          />
        );
        return (
          <Grid.Col span={3} key={avatar.id}>
            {isActive ? (
              <Indicator
                processing
                color="green"
                size={16}
                offset={16}
                withBorder
                position="top-start"
              >
                {card}
              </Indicator>
            ) : (
              card
            )}
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default AvatarList;