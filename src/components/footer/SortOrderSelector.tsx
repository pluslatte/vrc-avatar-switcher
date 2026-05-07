/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Select } from '@mantine/core';

const SortOrderSelector = (props: {
  selectedSort: string | null;
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