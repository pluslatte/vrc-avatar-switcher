/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Stack, Loader, Text } from '@mantine/core';

export const LoaderFullWindow = ({ message, withAppShell }: { message: string, withAppShell?: boolean }) => {
  return (
    <Stack align="center" justify="center" style={{ height: `${withAppShell ? 'calc(100vh - 200px)' : '100vh'}` }}>
      <Loader />
      <Text>{message}</Text>
    </Stack>
  );
};