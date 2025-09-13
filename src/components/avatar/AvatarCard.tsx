import { Avatar } from '@/lib/models';
import { ActionIcon, BackgroundImage, Badge, Button, Card, Divider, Group, Text, Tooltip } from '@mantine/core';
import { IconPlus, IconTag } from '@tabler/icons-react';

interface AvatarCardProps {
  avatar: Avatar;
  tags: Array<string>;
  tagColors: Record<string, string>;
  isActive: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  onAvatarSwitchClicked: (avatarId: string) => void;
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
          {props.tags.map((tag) => (
            <Badge color={props.tagColors[tag] || 'gray'} key={tag}>{tag}</Badge>
          ))}
          <Tooltip
            label="タグを追加"
          >
            <ActionIcon style={{ marginLeft: 'auto' }} size={20} color="gray" variant="subtle" radius="sm">
              <IconPlus />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card.Section>

    </Card>
  );
};

export default AvatarCard;