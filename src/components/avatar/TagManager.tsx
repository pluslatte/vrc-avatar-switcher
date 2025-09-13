import { Text } from '@mantine/core';

interface TagManagerProps {
  tags: Array<string>;
  tagColors: Record<string, string>;
  handlerRegisterAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRemoveAvatarTag: (tags: Record<string, string[]>, tagName: string, avatarId: string) => void;
  handlerRegisterAvatarTagColor: (tagColors: Record<string, string>, tagName: string, color: string) => void;
}
const TagManager = (props: TagManagerProps) => {
  return (<Text size="sm" mb="xs">タグを追加</Text>);
};

export default TagManager;