import { Stack, Loader, Text } from '@mantine/core';

export const LoaderFullWindow = ({ message, withAppShell }: { message: string, withAppShell?: boolean }) => {
  return (
    <Stack align="center" justify="center" style={{ height: `${withAppShell ? 'calc(100vh - 200px)' : '100vh'}` }}>
      <Loader />
      <Text>{message}</Text>
    </Stack>
  );
};