import { Avatar } from '@/lib/models';
import { BackgroundImage, Badge, Button, Card, Divider, Group, Text } from '@mantine/core';

interface AvatarCardProps {
  avatar: Avatar;
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
          <Badge color="cyan">hoge</Badge>
          <Badge color="green">huga</Badge>
        </Group>
      </Card.Section>

    </Card>
  );
};

export default AvatarCard;