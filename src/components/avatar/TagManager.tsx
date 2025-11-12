import { availableTagsQueryKey } from '@/hooks/useAvailableTagsQuery';
import { tagAvatarRelationQueryKey } from '@/hooks/useTagAvatarsRelationQuery';
import { createTag, createTagRelation, queryAllTagsAvailable, queryTagExists, Tag } from '@/lib/db';
import { Avatar } from '@/lib/models';
import { Badge, Box, Button, ColorPicker, DEFAULT_THEME, Divider, Group, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTagFilled } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface TagManagerProps {
  avatars: Array<Avatar>;
  avatarIds: Array<string>;
  tags: Array<Tag>;
  currentUserId: string;
  tagAvatarRelation?: Record<string, Array<Tag>>;
}
const TagManager = (props: TagManagerProps) => {
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, Record<string, string>>>({});

  const resolveTagsOfAvatar = useCallback((avatarId: string) => {
    const baseSource = props.tagAvatarRelation && props.tagAvatarRelation[avatarId]
      ? props.tagAvatarRelation[avatarId]
      : (props.avatarIds.length === 1 && props.avatarIds[0] === avatarId ? props.tags : []);
    const merged = [...baseSource];
    const pendingForAvatar = pendingAssignments[avatarId];
    if (pendingForAvatar) {
      const existingNames = new Set(merged.map(tag => tag.display_name));
      Object.entries(pendingForAvatar).forEach(([tagName, color]) => {
        if (!existingNames.has(tagName)) {
          merged.push({ display_name: tagName, color });
        }
      });
    }
    return merged;
  }, [pendingAssignments, props.avatarIds, props.tagAvatarRelation, props.tags]);

  useEffect(() => {
    if (!props.tagAvatarRelation) return;
    setPendingAssignments((prev) => {
      let updated = false;
      const next: Record<string, Record<string, string>> = {};
      Object.entries(prev).forEach(([avatarId, tagMap]) => {
        const baseNames = new Set(
          (props.tagAvatarRelation?.[avatarId] ?? [])
            .map(tag => tag.display_name)
        );
        const filteredEntries = Object.entries(tagMap).filter(([name]) => !baseNames.has(name));
        if (filteredEntries.length > 0) {
          next[avatarId] = Object.fromEntries(filteredEntries);
        }
        if (filteredEntries.length !== Object.keys(tagMap).length) {
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [props.tagAvatarRelation]);

  const handlerRegisterAvatarTag = async (tagName: string, currentUserId: string, avatarIds: Array<string>, color: string) => {
    if (isRegistering) return;
    const targetAvatarIds = avatarIds.filter((avatarId) => {
      const avatarTags = resolveTagsOfAvatar(avatarId);
      return !avatarTags.some(tag => tag.display_name === tagName);
    });
    if (targetAvatarIds.length === 0) {
      notifications.show({
        title: 'タグ追加',
        message: `タグ「${tagName}」は対象のアバターにすでに割り当て済みです。`,
        color: 'yellow',
      });
      return;
    }
    setIsRegistering(true);
    const tagExists = await queryTagExists(tagName, currentUserId);
    try {
      if (!tagExists) {
        await createTag(tagName, currentUserId, color);
        notifications.show({
          title: 'タグ作成',
          message: `タグ「${tagName}」を新規作成しました`,
          color: 'green',
        });
        queryClient.invalidateQueries({ queryKey: availableTagsQueryKey(currentUserId) });
      }
      await Promise.all(targetAvatarIds.map(avatarId => createTagRelation(tagName, avatarId, currentUserId)));
      setPendingAssignments((prev) => {
        const next: Record<string, Record<string, string>> = { ...prev };
        targetAvatarIds.forEach((avatarId) => {
          const current = { ...(next[avatarId] ?? {}) };
          current[tagName] = color;
          next[avatarId] = current;
        });
        return next;
      });
      setNewTagName('');
      notifications.show({
        title: 'タグ追加',
        message: `タグ「${tagName}」を${targetAvatarIds.length}件のアバターに追加しました。`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: tagAvatarRelationQueryKey(props.avatars, props.currentUserId) });
    } catch (error) {
      console.error('Error registering avatar tag:', error);
      notifications.show({
        title: 'タグ登録エラー',
        message: `タグ「${tagName}」の登録中にエラーが発生しました: ${(error as Error).message}`,
        color: 'red',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const tagsAvailableQuery = useQuery({
    queryKey: availableTagsQueryKey(props.currentUserId),
    queryFn: async () => {
      const tags = await queryAllTagsAvailable(props.currentUserId);
      return tags;
    }
  });

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2C2E33');
  const disabledTagNames = useMemo(() => {
    if (props.avatarIds.length === 0) return [] as Array<string>;
    return props.avatarIds.reduce<Array<string>>((common, avatarId, index) => {
      const names = resolveTagsOfAvatar(avatarId).map(tag => tag.display_name);
      if (index === 0) return names;
      const nameSet = new Set(names);
      return common.filter(name => nameSet.has(name));
    }, []);
  }, [props.avatarIds, resolveTagsOfAvatar]);
  const disabledTagNamesUpper = useMemo(
    () => disabledTagNames.map(name => name.toUpperCase()),
    [disabledTagNames]
  );
  return (
    <Box>
      <Text size="sm" mb="xs">タグを選択</Text>
      {tagsAvailableQuery.isPending && <Text c="dimmed" mb="xs">タグを読み込み中...</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length === 0 && <Text c="dimmed" fz="xs" mb="xs">利用可能なタグがありません</Text>}
      {tagsAvailableQuery.data && tagsAvailableQuery.data.length > 0 && (
        <Group gap="xs" mb="xs">
          {tagsAvailableQuery.data.length > 0 && tagsAvailableQuery.data
            .filter(tag => !(disabledTagNames.includes(tag.display_name)))
            .map(tag => (
              <Badge
                key={tag.display_name}
                color={tag.color || 'gray'}
                variant="filled"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (isRegistering) return;
                  handlerRegisterAvatarTag(tag.display_name, props.currentUserId, props.avatarIds, tag.color);
                }}
              >
                {tag.display_name}
              </Badge>
            ))}
        </Group>
      )}
      <Divider mb="xs" />
      <Text size="sm" mb="xs">新規タグ</Text>
      <Group gap="xs">
        <ColorPicker
          format="hex"
          value={newTagColor}
          onChange={(color) => setNewTagColor(color)}
          withPicker={false}
          fullWidth
          swatches={[
            ...DEFAULT_THEME.colors.red.slice(3, 10),
            ...DEFAULT_THEME.colors.green.slice(3, 10),
            ...DEFAULT_THEME.colors.blue.slice(3, 10),
            ...DEFAULT_THEME.colors.yellow.slice(3, 10),
            ...DEFAULT_THEME.colors.dark.slice(3, 10),
          ]}
        />
        <TextInput
          placeholder="タグ名"
          value={newTagName}
          onChange={(event) => setNewTagName(event.currentTarget.value)}
        />
        <Button
          color={newTagColor}
          variant="gradient"
          gradient={{ from: 'dark', to: newTagColor, deg: 45 }}
          disabled={newTagName.trim() === '' ||
            disabledTagNamesUpper.includes(newTagName.trim().toUpperCase())}
          fullWidth
          onClick={() => {
            notifications.show({
              message: 'タグを作成しています...',
              color: 'blue',
            });
            handlerRegisterAvatarTag(newTagName, props.currentUserId, props.avatarIds, newTagColor);
          }}
          loading={isRegistering}
        >
          追加
          <IconTagFilled style={{ marginLeft: 5 }} />
        </Button>
      </Group>
    </Box>
  );
};

export default TagManager;