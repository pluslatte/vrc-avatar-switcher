import { ActionIcon, Group, Select, Text } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';

interface FooterContentsProps {
  selectedSort: 'Name' | 'Updated';
  onSelectorChange: (option: string | null) => void;
}
const FooterContents = (props: FooterContentsProps) => {
  return (
    <Group px="md" mt="8">
      <Text>Sort by:</Text>
      <Select
        data={[{ value: 'Name', label: 'Name' }, { value: 'Updated', label: 'Updated' }]}
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