import { Box, Grid, Indicator } from '@mantine/core';
import AvatarCard from './AvatarCard';
import { Avatar, CurrentUser } from '@/lib/models';

interface AvatarListProps {
  avatars: Array<Avatar>;
  tags: Record<string, string[]>;
  tagColors: Record<string, string>;
  currentUser: CurrentUser;
  pendingSwitch: boolean;
  cardImageSize: number;
  cardNumberPerRow: number;
  handlerAvatarSwitch: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
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
              isActive={isActive}
              tags={props.tags}
              associatedTagNames={Object.keys(props.tags).filter(tagName => props.tags[tagName].includes(avatar.id))}
              tagColors={props.tagColors}
              pendingSwitch={props.pendingSwitch}
              imageSize={props.cardImageSize}
              onAvatarSwitchClicked={props.handlerAvatarSwitch}
              handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
              handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
              handlerRegisterAvatarTagColor={props.handlerRegisterAvatarTagColor}
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