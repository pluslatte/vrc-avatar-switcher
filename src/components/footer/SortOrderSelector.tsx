import { Select } from '@mantine/core';
import { AvatarSortOrder } from '@/lib/models';

const SortOrderSelector = (props: {
  selectedSort: AvatarSortOrder;
  onSortSettingChange: (option: string | null) => void;
}) => {
  return (
    <Select
      data={[{ value: 'Name', label: '名前' }, { value: 'Updated', label: '更新日' }]}
      style={{ width: 100 }}
      value={props.selectedSort}
      onChange={props.onSortSettingChange}
    />
  );
};

export default SortOrderSelector;