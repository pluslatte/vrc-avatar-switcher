import { notifications } from '@mantine/notifications';

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
