import { Avatar, CurrentUser } from '@/lib/models';
import { ActionIcon, BackgroundImage, Badge, Button, Card, Divider, Group, Text, Tooltip } from '@mantine/core';
import TagManagerButton from './TagManagerButton';
import { IconX } from '@tabler/icons-react';
import { Tag } from '@/lib/db';

interface AvatarCardProps {
  avatar: Avatar;
  avatarTags: Array<Tag>
  currentUser: CurrentUser;
  isActiveAvatar: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  selectedTags: Array<string>;
  onAvatarSwitchClicked: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, currentUserId: string, avatarId: string, color: string) => Promise<void>;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, currentUserId: string) => Promise<void>;
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
        >
          {props.isActiveAvatar ? 'Active' : 'Select'}
        </Button>
      </BackgroundImage>

      <Card.Section p="sm" h="48px">
        <Tooltip label={props.avatar.name}>
          <Text
            fw={500}
            size="md"
          >
            {props.avatar.name}
          </Text>
        </Tooltip>
      </Card.Section>
      <Divider />
      <Card.Section p="sm">
          <Group gap="xs">
            {props.avatarTags.map((tag) => (
              <Badge color={tag.color || 'gray'} key={tag.display_name}>
                {tag.display_name}
                <ActionIcon
                  size={13}
                  color="dark"
                  variant="transparent"
                  onClick={() => {
                    props.handlerRemoveAvatarTag(tag.display_name, props.avatar.id, props.currentUser.id);
                  }}
                  style={{ marginLeft: 4, paddingTop: 3 }}
                >
                  <IconX />
                </ActionIcon>
              </Badge>
            ))}
            {props.avatarTags.length === 0 && <Text c="dimmed" fz="sm">タグが設定されていません</Text>}
            <TagManagerButton
              avatarId={props.avatar.id}
              tags={props.avatarTags}
              currentUserId={props.currentUser.id}
              handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
              handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
            />
          </Group>
      </Card.Section>
    </Card>
  );
};

export default AvatarCard;