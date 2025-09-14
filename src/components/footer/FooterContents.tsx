import { ActionIcon, Badge, Box, Divider, Group, LoadingOverlay, MultiSelect, Popover } from '@mantine/core';
import { IconFilter, IconImageInPicture, IconSettings, IconSortAscendingShapes, IconTableColumn, IconTagMinus, IconX } from '@tabler/icons-react';
import SortOrderSelector from './SortOrderSelector';
import AvatarCardImageSizeSelector from './AvatarCardImageSizeSelector';
import AvatarCardColumnSizeSelector from './AvatarCardColumnSizeSelector';
import AvatarListRefreshButton from './AvatarListRefreshButton';
import { AvatarSortOrder, CurrentUser } from '@/lib/models';
import { useQuery } from '@tanstack/react-query';
import { dropTag, queryAllTagsAvailable } from '@/lib/db';
import { notifications } from '@mantine/notifications';

interface FooterContentsProps {
  currentUser: CurrentUser;
  selectedSort: AvatarSortOrder;
  cardImageSize: number | undefined;
  cardImageSizeLoading: boolean;
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardImageSize: (size: string | null) => void;
  onSortSettingChange: (option: string | null) => void;
  setCardNumberPerRow: (number: string | null) => void;
  onRefreshButtonClick: () => void;
  onTagFilterChange: (tags: Array<string>) => void;
}
const FooterContents = (props: FooterContentsProps) => {
  const tagQuery = useQuery({
    queryKey: ['tags', props.currentUser.id],
    queryFn: async () => {
      const tags = await queryAllTagsAvailable(props.currentUser.id);
      return tags;
    }
  });

  const dropTagHandler = async (tagName: string, currentUserId: string) => {
    await dropTag(tagName, currentUserId);
    await tagQuery.refetch();
    notifications.show({
      title: 'タグ削除',
      message: `タグ「${tagName}」を削除しました（関連付けられたアバターからも削除されました）`,
      color: 'green',
    });
  };

  return (
    <Group px="md" mt="8">
      <AvatarListRefreshButton
        onRefreshButtonClick={props.onRefreshButtonClick}
      />
      <Divider orientation="vertical" />
      <IconSortAscendingShapes />
      <SortOrderSelector
        selectedSort={props.selectedSort}
        onSortSettingChange={props.onSortSettingChange}
      />
      <Divider orientation="vertical" />
      <IconFilter />
      <Box pos="relative">
        <LoadingOverlay visible={tagQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
        <MultiSelect
          placeholder="タグでフィルター"
          data={tagQuery.data ? tagQuery.data.map(tag => ({ value: tag.display_name, label: tag.display_name })) : []}
          searchable
          onChange={props.onTagFilterChange}
        />
      </Box>
      <Divider orientation="vertical" />
      <Popover width={300} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon
            style={{ marginLeft: 'auto' }}
            color="gray"
            variant="subtle"
            radius="sm"
          >
            <IconTagMinus />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Box pos="relative">
            <Group gap="xs">
              <LoadingOverlay visible={tagQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
              {tagQuery.data?.map((tag) => (
                <Badge color={tag.color || 'gray'} key={tag.display_name}>
                  {tag.display_name}
                  <ActionIcon
                    size={13}
                    color="dark"
                    variant="transparent"
                    onClick={() => {
                      dropTagHandler(tag.display_name, props.currentUser.id);
                    }}
                    style={{ marginLeft: 4, paddingTop: 3 }}
                  >
                    <IconX />
                  </ActionIcon>
                </Badge>
              ))}
            </Group>
          </Box>
        </Popover.Dropdown>
      </Popover>
      <Divider orientation="vertical" />
      <Popover width={300} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon
            color="gray"
            variant="subtle"
            radius="sm"
          >
            <IconSettings />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <Group>
            <IconImageInPicture />
            <AvatarCardImageSizeSelector
              cardImageSize={props.cardImageSize}
              cardImageSizeLoading={props.cardImageSizeLoading}
              setCardImageSize={props.setCardImageSize}
            />
          </Group>
          <Divider my="xs" />
          <Group>
            <IconTableColumn />
            <AvatarCardColumnSizeSelector
              cardNumberPerRow={props.cardNumberPerRow}
              cardNumberPerRowLoading={props.cardNumberPerRowLoading}
              setCardNumberPerRow={props.setCardNumberPerRow}
            />
          </Group>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
};

export default FooterContents;