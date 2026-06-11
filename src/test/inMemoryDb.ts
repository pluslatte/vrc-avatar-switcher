import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// マイグレーション SQL の単一情報源は src-tauri/src/migrations.rs。
// tauri-plugin-sql（sqlx）は適用済みマイグレーションの checksum を検証するため、
// migrations.rs 内の SQL 文字列は空白 1 つ変えるだけで既存 DB の起動が失敗する。
// そのためファイル分割はせず、テスト側が migrations.rs をパースして同じ SQL を適用する。
// （Vitest はプロジェクトルートを cwd として実行される前提）
const migrationsRsPath = resolve(process.cwd(), 'src-tauri/src/migrations.rs');

export const loadMigrationSqls = (): Array<string> => {
  const source = readFileSync(migrationsRsPath, 'utf-8');
  const blocks = [...source.matchAll(/version:\s*(\d+)[\s\S]*?sql:\s*"([\s\S]*?)"/g)];
  if (blocks.length === 0) {
    throw new Error('migrations.rs からマイグレーション SQL を抽出できませんでした。フォーマットが変わった場合は src/test/inMemoryDb.ts のパーサを更新してください。');
  }
  return blocks
    .map(match => ({ version: Number(match[1]), sql: match[2] }))
    .sort((a, b) => a.version - b.version)
    .map(block => block.sql);
};

// tauri-plugin-sql の Database のうち、src/lib/db/* が使う表面だけを再現する
export interface TestDb {
  select<T>(query: string, bindValues?: Array<unknown>): Promise<T>;
  execute(query: string, bindValues?: Array<unknown>): Promise<{ rowsAffected: number; lastInsertId: number }>;
  close(): void;
}

// plugin-sql の "$1" 形式を SQLite ネイティブの "?1" 形式に変換する
const toSqlitePlaceholders = (query: string): string => query.replace(/\$(\d+)/g, '?$1');

const toBindParams = (bindValues?: Array<unknown>): Array<string | number | null> =>
  (bindValues ?? []) as Array<string | number | null>;

export const createTestDb = (): TestDb => {
  const db = new DatabaseSync(':memory:');
  // sqlx の SQLite 接続は foreign_keys が既定で有効。本番挙動（CASCADE 等）に合わせる
  db.exec('PRAGMA foreign_keys = ON;');
  for (const sql of loadMigrationSqls()) {
    db.exec(sql);
  }

  return {
    select: async <T,>(query: string, bindValues?: Array<unknown>): Promise<T> => {
      const stmt = db.prepare(toSqlitePlaceholders(query));
      return stmt.all(...toBindParams(bindValues)) as unknown as T;
    },
    execute: async (query: string, bindValues?: Array<unknown>) => {
      const stmt = db.prepare(toSqlitePlaceholders(query));
      const result = stmt.run(...toBindParams(bindValues));
      return {
        rowsAffected: Number(result.changes),
        lastInsertId: Number(result.lastInsertRowid),
      };
    },
    close: () => db.close(),
  };
};
