import { Avatar, CurrentUser } from '@/lib/models';
import { BackgroundImage, Button, Card, Divider, Text, Tooltip } from '@mantine/core';
import { Tag } from '@/lib/db';
import AvatarTags from './AvatarTags';

interface AvatarCardProps {
  avatar: Avatar;
  avatarTags: Array<Tag>
  currentUser: CurrentUser;
  isActiveAvatar: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  selectedTags: Array<string>;
  onAvatarSwitchClicked: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
}

const AvatarCard = (props: AvatarCardProps) => {
  const handleSwitch = () => {
    if (props.isActiveAvatar) return;
    props.onAvatarSwitchClicked(props.avatar.id);
  };

  return (
    <Card
      shadow='lg'
      radius="md"
      withBorder
      bg={props.isActiveAvatar ? 'dark' : ''}
    >
      <BackgroundImage
        radius="md"
        src={props.avatar.thumbnailImageUrl}
      >
        <Button
          variant="gradient"
          gradient={{ from: 'transparent', to: 'dark', deg: 180 }}
          fullWidth
          fz="h2"
          radius="sm"
          h={props.imageSize || 120}
          disabled={props.isActiveAvatar}
          loading={props.pendingSwitch && !props.isActiveAvatar}
          onClick={handleSwitch}
        >
          {props.isActiveAvatar ? 'Active' : 'Select'}
        </Button>
      </BackgroundImage>

      <Card.Section p="sm" h="48px">
        <Tooltip label={props.avatar.name}>
          <Text
            fw={500}
            size="md"
            lineClamp={1}
          >
            {props.avatar.name}
          </Text>
        </Tooltip>
      </Card.Section>
      <Divider />
      <Card.Section p="sm">
        <AvatarTags
          avatar={props.avatar}
          avatarTags={props.avatarTags}
          currentUser={props.currentUser}
          handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
          handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
        />
      </Card.Section>
    </Card>
  );
};

export default AvatarCard;