import { Avatar, CurrentUser } from '@/lib/models';
import { ActionIcon, BackgroundImage, Badge, Button, Card, Divider, Group, Text, Tooltip } from '@mantine/core';
import TagManagerButton from './TagManagerButton';
import { IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { fetchAvatarTags } from '@/lib/db';

interface AvatarCardProps {
  avatar: Avatar;
  currentUser: CurrentUser;
  isActiveAvatar: boolean;
  pendingSwitch: boolean;
  imageSize: number | null;
  onAvatarSwitchClicked: (avatarId: string) => void;
  handlerRegisterAvatarTag: (tagName: string, username: string, avatarId: string, color: string) => void;
  handlerRemoveAvatarTag: (tagName: string, avatarId: string, username: string) => void;
}

const AvatarCard = (props: AvatarCardProps) => {
  const tagQuery = useQuery({
    queryKey: ['tags', props.avatar.id, props.currentUser.id],
    queryFn: async () => {
      const tags = await fetchAvatarTags(props.avatar.id, props.currentUser.id);
      return tags;
    },
  });

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
        {tagQuery.isLoading && <Text>タグを読み込み中...</Text>}
        {tagQuery.isError && <Text c="red">タグの読み込みに失敗しました</Text>}
        {tagQuery.data && (
          <Group gap="xs">
            {tagQuery.data.map((tag) => (
              <Badge color={tag.color || 'gray'} key={tag.display_name}>
                {tag.display_name}
                <ActionIcon
                  size={13}
                  color="dark"
                  variant="transparent"
                  onClick={() => {
                    notifications.show({
                      message: 'タグを削除しています...',
                      color: 'blue',
                    });
                    props.handlerRemoveAvatarTag(tag.display_name, props.avatar.id, props.currentUser.id);
                  }}
                  style={{ marginLeft: 4, paddingTop: 3 }}
                >
                  <IconX />
                </ActionIcon>
              </Badge>
            ))}
            {tagQuery.data.length === 0 && <Text c="dimmed">タグが設定されていません</Text>}
            <TagManagerButton
              avatarId={props.avatar.id}
              tags={tagQuery.data}
              currentUserId={props.currentUser.id}
              handlerRegisterAvatarTag={props.handlerRegisterAvatarTag}
              handlerRemoveAvatarTag={props.handlerRemoveAvatarTag}
            />
          </Group>
        )}
      </Card.Section>

    </Card>
  );
};

export default AvatarCard;