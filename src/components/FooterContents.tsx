import { ActionIcon, Group, Select, Text } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';

interface FooterContentsProps {
  selectedSort: 'Name' | 'Updated';
  onSelectorChange: (option: string | null) => void;
}
const FooterContents = (props: FooterContentsProps) => {
  return (
    <Group px="md" mt="8">
      <Text>ソート設定:</Text>
      <Select
        data={[{ value: 'Name', label: '名前' }, { value: 'Updated', label: '更新日' }]}
        style={{ width: 200 }}
        value={props.selectedSort}
        onChange={props.onSelectorChange}
      />
      <ActionIcon
        variant="filled"
        style={{ marginLeft: 'auto' }}
        size="xl"
      >
        <IconReload />
      </ActionIcon>
    </Group>
  );
};

export default FooterContents;