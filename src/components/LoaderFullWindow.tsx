import { Stack, Loader, Text } from '@mantine/core';

export const LoaderFullWindow = ({ message }: { message: string }) => {
  return (
    <Stack align="center" justify="center" style={{ height: '100vh' }}>
      <Loader />
      <Text>{message}</Text>
    </Stack>
  );
};