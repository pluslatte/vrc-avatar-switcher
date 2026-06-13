import Database from '@tauri-apps/plugin-sql';

export const getDb = () => Database.load('sqlite:vrc-avatar-switcher.db');
