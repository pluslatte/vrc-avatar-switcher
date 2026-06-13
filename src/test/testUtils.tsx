import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

// テストではリトライ無効（失敗ケースを即座に観測するため）
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// main.tsx と同じプロバイダ構成でコンポーネントを描画する
export const renderWithProviders = (
  ui: ReactNode,
  queryClient: QueryClient = createTestQueryClient(),
) => ({
  queryClient,
  ...render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider forceColorScheme="dark">{ui}</MantineProvider>
    </QueryClientProvider>,
  ),
});

// renderHook 用の QueryClientProvider ラッパー
export const createQueryWrapper = (queryClient: QueryClient) => {
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};
