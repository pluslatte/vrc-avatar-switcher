import { Box, Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';

interface AvatarListProps {
  avatars: Array<Avatar>;
  currentUsername: string;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  cardImageSize: number;
  cardNumberPerRow: number;
  handlerAvatarSwitch: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, username: string, avatarId: string, color: string) => void;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, username: string) => void;
}
const AvatarList = (props: AvatarListProps) => {
  return (
    <Grid overflow="hidden" gutter="lg">
      {props.avatars.map(avatar => {
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const card = (
          <Box>
            <AvatarCard
              avatar={avatar}
              currentUsername={props.currentUsername}
              isActiveAvatar={isActive}
              pendingSwitch={props.pendingSwitch}
              imageSize={props.cardImageSize}
              onAvatarSwitchClicked={props.handlerAvatarSwitch}
              handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
              handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
            />
          </Box>
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