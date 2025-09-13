import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';

interface AvatarListProps {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  cardImageSize: number;
  cardNumberPerRow: number;
  handlerAvatarSwitch: (avatarId: string) => void;
}
const AvatarList = (props: AvatarListProps) => {
  return (
    <Grid overflow="hidden" gutter="lg">
      {props.avatars.map(avatar => {
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const card = (
          <AvatarCard
            avatar={avatar}
            isActive={isActive}
            pendingSwitch={props.pendingSwitch}
            imageSize={props.cardImageSize}
            onAvatarSwitchClicked={props.handlerAvatarSwitch}
          />
        );
        return (
          <Grid.Col span={props.cardNumberPerRow} key={avatar.id}>
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