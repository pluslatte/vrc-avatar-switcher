import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { queryKeys } from '@/lib/queryKeys';

// クエリの失敗は認証切れの可能性があるため、認証状態を確認し直す。
// authCheck 自身の失敗で無効化すると再フェッチがループするため除外する。
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (query.queryKey[0] === queryKeys.authCheck[0]) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.authCheck });
    },
  }),
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider forceColorScheme="dark">
        <App />
        <Notifications position="top-right" />
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
