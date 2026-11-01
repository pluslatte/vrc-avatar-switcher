import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const migrationsRsPath = resolve(process.cwd(), 'src-tauri/src/migrations.rs');

export const loadMigrationSqls = (): Array<string> => {
  const source = readFileSync(migrationsRsPath, 'utf-8');
  const blocks = [...source.matchAll(/version:\s*(\d+)[\s\S]*?sql:\s*"([\s\S]*?)"/g)];
  if (blocks.length === 0) {
    throw new Error('Could not extract migration SQL from migrations.rs. Update the parser in src/test/inMemoryDb.ts if the format has changed.');
  }
  return blocks
    .map(match => ({ version: Number(match[1]), sql: match[2] }))
    .sort((a, b) => a.version - b.version)
    .map(block => block.sql);
};

export interface TestDb {
  select<T>(query: string, bindValues: Array<string | number>): Promise<T>;
  execute(query: string, bindValues: Array<string | number>): Promise<{ rowsAffected: number; lastInsertId: number }>;
  close(): void;
}

const toSqlitePlaceholders = (query: string): string => query.replace(/\$(\d+)/g, '?$1');

export const createTestDb = (): TestDb => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  for (const sql of loadMigrationSqls()) {
    db.exec(sql);
  }

  return {
    select: async <T,>(query: string, bindValues: Array<string | number>): Promise<T> => {
      const stmt = db.prepare(toSqlitePlaceholders(query));
      return stmt.all(...bindValues) as unknown as T;
    },
    execute: async (query: string, bindValues: Array<string | number>) => {
      const stmt = db.prepare(toSqlitePlaceholders(query));
      const result = stmt.run(...bindValues);
      return {
        rowsAffected: Number(result.changes),
        lastInsertId: Number(result.lastInsertRowid),
      };
    },
    close: () => db.close(),
  };
};
