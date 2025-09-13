import { Avatar } from '@/lib/models';
import { BackgroundImage, Badge, Button, Card, Divider, Group, Text } from '@mantine/core';
import TagManagerButton from './TagManagerButton';

interface AvatarCardProps {
  avatar: Avatar;
  tags: Record<string, string[]>;
  associatedTagNames: string[];
  tagColors: Record<string, string>;
  isActive: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  onAvatarSwitchClicked: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
}

const AvatarCard = (props: AvatarCardProps) => {
  const handleSwitch = () => {
    if (props.isActive) return;
    props.onAvatarSwitchClicked(props.avatar.id);
  };

  return (
    <Card
      shadow='lg'
      radius="md"
      withBorder
      bg={props.isActive ? 'dark' : ''}
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
          disabled={props.isActive}
          loading={props.pendingSwitch && !props.isActive}
          onClick={handleSwitch}
        >
          {props.isActive ? 'Active' : 'Select'}
        </Button>
      </BackgroundImage>

      <Card.Section p="sm" h="48px">
        <Text
          fw={500}
          size="md"
        >
          {props.avatar.name}
        </Text>
      </Card.Section>
      <Divider />
      <Card.Section p="sm">
        <Group gap="xs">
          {props.associatedTagNames.map((tag) => (
            <Badge color={props.tagColors[tag] || 'gray'} key={tag}>{tag}</Badge>
          ))}
          <TagManagerButton
            tags={props.tags}
            tagColors={props.tagColors}
            handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
            handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
            handlerRegisterAvatarTagColor={props.handlerRegisterAvatarTagColor}
          />
        </Group>
      </Card.Section>

    </Card>
  );
};

export default AvatarCard;