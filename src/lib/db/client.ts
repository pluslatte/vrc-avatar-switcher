import { invoke } from '@tauri-apps/api/core';

type DatabaseError =
  | { kind: 'DuplicateTag'; message: string }
  | { kind: 'Database'; message: string };

export const invokeDatabaseCommand = <T>(
  command: string,
  args: Record<string, unknown>,
): Promise<T> => invoke<T>(command, args).catch((error: DatabaseError | string) => {
  if (typeof error === 'string') {
    throw new Error(error);
  }
  if (error.kind === 'DuplicateTag') {
    throw new Error(`タグ名「${error.message}」は既に存在します`);
  }
  throw new Error(error.message);
});
