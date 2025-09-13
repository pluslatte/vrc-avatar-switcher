import { Avatar } from '@/lib/models';
import { Button, Card, Group, Image, Text } from '@mantine/core';

interface AvatarCardProps {
  avatar: Avatar;
  isActive: boolean;
}

const AvatarCard = (props: AvatarCardProps) => (
  <Card
    shadow={props.isActive ? 'lg' : 'md'}
    padding="lg"
    radius="md"
    withBorder
    style={{
      borderColor: props.isActive ? '#00bcd4' : '#e0e0e0',
      backgroundColor: props.isActive ? '#e0f7fa' : 'white',
    }}
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
    >
      {props.isActive ? 'Active' : 'Select'}
    </Button>
  </Card>
);

export default AvatarCard;