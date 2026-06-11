import { notifications } from '@mantine/notifications';

// Tauri コマンドのエラーは string で reject されるため、
// Error 以外の型も考慮してメッセージを取り出す。
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

export const notifyError = (title: string, message: string) => {
  notifications.show({ title, message, color: 'red' });
};

export const notifySuccess = (title: string, message: string) => {
  notifications.show({ title, message, color: 'green' });
};
