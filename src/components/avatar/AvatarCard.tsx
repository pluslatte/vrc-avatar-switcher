import { Avatar, CurrentUser } from '@/lib/models';
import { BackgroundImage, Button, Card, Divider, Text, Tooltip } from '@mantine/core';
import { Tag } from '@/lib/db';
import AvatarTags from './AvatarTags';

interface AvatarCardProps {
  avatar: Avatar;
  avatars: Array<Avatar>;
  avatarTags: Array<Tag>;
  currentUser: CurrentUser;
  isActiveAvatar: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  onAvatarSwitchClicked: (avatarId: string) => void;
  onTagRemove: (params: { tagName: string; avatarId: string; currentUserId: string }) => void;
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
      style={props.isActiveAvatar
        ? { border: '2px solid var(--mantine-color-orange-7)' }
        : undefined}
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
          style={{
            color: props.isActiveAvatar
              ? 'var(--mantine-color-orange-7)'
              : undefined,
            textShadow: '0 0 10px rgba(63, 63, 63, 0.8)',
            backgroundColor: props.isActiveAvatar
              ? '#111111AA'
              : undefined,
          }}
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
          avatars={props.avatars}
          avatarTags={props.avatarTags}
          currentUser={props.currentUser}
          onTagRemove={props.onTagRemove}
        />
      </Card.Section>
    </Card>
  );
};

export default AvatarCard;