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

import { Box, LoadingOverlay, SegmentedControl } from '@mantine/core';

const AvatarCardColumnSizeSelector = (props: {
  cardNumberPerRow: number | undefined;
  cardNumberPerRowLoading: boolean;
  setCardNumberPerRow: (number: string | null) => void;
}) => {
  return (
    <Box pos="relative">
      <LoadingOverlay visible={props.cardNumberPerRowLoading} overlayProps={{ radius: 'md', blur: 2 }} />
      <SegmentedControl
        disabled={!props.cardNumberPerRow || props.cardNumberPerRowLoading}
        value={props.cardNumberPerRow?.toString()}
        onChange={props.setCardNumberPerRow}
        data={[
          { label: '3列', value: '4' },
          { label: '4列', value: '3' },
          { label: '6列', value: '2' },
        ]}
      />
    </Box>
  );
};

export default AvatarCardColumnSizeSelector;