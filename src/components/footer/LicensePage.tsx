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

import { Modal, Text, ScrollArea } from '@mantine/core';

interface LicensePageProps {
  opened: boolean;
  onClose: () => void;
}

const LicensePage = (props: LicensePageProps) => {
  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title="License"
      size="lg"
      centered
    >
      <ScrollArea h={400}>
        <Text style={{ whiteSpace: 'pre-line' }}>
          {`Copyright 2025 pluslatte

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`}
        </Text>
      </ScrollArea>
    </Modal>
  );
};

export default LicensePage;