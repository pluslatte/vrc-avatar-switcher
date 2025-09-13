import { Avatar } from '@/lib/models';
import { Box, Button, Card, Image, Text } from '@mantine/core';

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
      radius="md"
      withBorder
      bg={props.isActive ? 'darkcyan' : ''}
    >
      <Box h={props.imageSize || 120}>
        <Image
          radius={'md'}
          src={props.avatar.thumbnailImageUrl}
          alt={props.avatar.name}
          height="100%"
        />
      </Box>

      <Card.Section p="sm" h="48px">
        <Text
          fw={500}
          size="md"
        >
          {props.avatar.name}
        </Text>
      </Card.Section>

      <Button
        color="cyan"
        variant="outline"
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