import { Avatar } from '@/lib/models';
import { Card, Group, Image, Text } from '@mantine/core';

interface AvatarCardProps {
  avatar: Avatar;
}

const AvatarCard = (props: AvatarCardProps) => (
  <Card shadow="sm" padding="lg" radius="md" withBorder>
    <Card.Section>
      <Image src={props.avatar.thumbnailImageUrl} alt={props.avatar.name} />
    </Card.Section>

    <Group justify="space-between" mt="md" mb="xs">
      <Text fw={500}>{props.avatar.name}</Text>
    </Group>
  </Card>
);

export default AvatarCard;