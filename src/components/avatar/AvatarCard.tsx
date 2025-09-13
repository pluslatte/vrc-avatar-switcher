import { Avatar } from '@/lib/models';
import { Button, Card, Group, Image, Text } from '@mantine/core';

interface AvatarCardProps {
  avatar: Avatar;
  isActive: boolean;
  pendingSwitch: boolean;
  onAvatarSwitchClicked: (avatarId: string) => void;
}

const AvatarCard = (props: AvatarCardProps) => {
  const handleSwitch = () => {
    if (props.isActive) return;
    props.onAvatarSwitchClicked(props.avatar.id);
  };

  return (
    <Card
      shadow={props.isActive ? 'lg' : 'md'}
      padding="lg"
      radius="md"
      withBorder
      bg={props.isActive ? 'darkcyan' : ''}
    >
      <Card.Section>
        <Image src={props.avatar.thumbnailImageUrl} alt={props.avatar.name} />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{props.avatar.name}</Text>
      </Group>

      <Button
        color="cyan"
        fullWidth
        size="lg"
        mt="md"
        radius="md"
        disabled={props.isActive}
        loading={props.pendingSwitch && !props.isActive}
        onClick={handleSwitch}
      >
        {props.isActive ? 'Active' : 'Select'}
      </Button>
    </Card>
  );
};

export default AvatarCard;