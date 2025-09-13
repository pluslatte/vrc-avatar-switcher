import { Avatar } from '@/lib/models';
import { Card, Image } from '@mantine/core';

interface AvatarCardProps {
  avatar: Avatar;
}

const AvatarCard = (props: AvatarCardProps) => (
  <Card shadow="sm" padding="lg" radius="md" withBorder>
    <Card.Section>
      <Image src={props.avatar.thumbnailImageUrl} alt={props.avatar.name} />
    </Card.Section>
  </Card>
);

export default AvatarCard;