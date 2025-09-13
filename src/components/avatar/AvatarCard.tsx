import { Avatar } from '@/lib/models';
import { Button, Card, Image, Text } from '@mantine/core';

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
      shadow={props.isActive ? 'lg' : 'md'}
      padding="lg"
      radius="md"
      withBorder
      bg={props.isActive ? 'darkcyan' : ''}
    >
      <Card.Section withBorder h={props.imageSize || 120}>
        <Image
          src={props.avatar.thumbnailImageUrl}
          alt={props.avatar.name}
          height="100%"
        />
      </Card.Section>

      <Card.Section p="sm" h="48px">
        <Text
          fw={500}
          size={
            props.avatar.name.length > 16
              ? (props.avatar.name.length > 20
                ? 'xs'
                : 'sm')
              : 'md'}
        >
          {props.avatar.name}
        </Text>
      </Card.Section>

      <Button
        color="cyan"
        fullWidth
        size="lg"
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