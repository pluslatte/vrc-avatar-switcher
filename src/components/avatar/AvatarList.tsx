import { Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';

interface AvatarListProps {
  avatars: Array<Avatar>;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  cardImageSize: number;
  cardNumberPerRow: number;
  selectedTags: Array<string>;
  handlerAvatarSwitch: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
}
const AvatarList = (props: AvatarListProps) => {
  return (
    <Grid overflow="hidden" gutter="lg">
      {props.avatars.map(avatar => {
        const isActive = props.currentUser.currentAvatar === avatar.id;
        const card = (
            <AvatarCard
              avatar={avatar}
              currentUser={props.currentUser}
              isActiveAvatar={isActive}
              pendingSwitch={props.pendingSwitch}
              imageSize={props.cardImageSize}
              selectedTags={props.selectedTags}
              onAvatarSwitchClicked={props.handlerAvatarSwitch}
              handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
              handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
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