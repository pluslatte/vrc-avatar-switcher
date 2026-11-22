import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: ReactNode,
  queryClient: QueryClient,
) => ({
  queryClient,
  ...render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider forceColorScheme="dark">{ui}</MantineProvider>
    </QueryClientProvider>,
  ),
});

export const createQueryWrapper = (queryClient: QueryClient) => {
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};
