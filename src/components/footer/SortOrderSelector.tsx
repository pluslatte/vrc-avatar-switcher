import { Select } from '@mantine/core';

const SortOrderSelector = (props: {
  selectedSort: string | null;
  onSortSettingChange: (option: string | null) => void;
}) => {
  return (
    <Select
      data={[{ value: 'Name', label: '名前' }, { value: 'Updated', label: '更新日' }]}
      style={{ width: 200 }}
      value={props.selectedSort}
      onChange={props.onSortSettingChange}
    />
  );
};

export default SortOrderSelector;