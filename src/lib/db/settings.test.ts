import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import {
  loadAvatarSortOrder,
  loadCardImageSize,
  loadCardNumberPerRow,
  queryClientConfig,
  saveAvatarSortOrder,
  saveCardImageSize,
  saveCardNumberPerRow,
  updateClientConfig,
} from '@/lib/db';

let db: TestDb;

vi.mock('@/lib/db/client', () => ({
  getDb: async () => db,
}));

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe('queryClientConfig / updateClientConfig', () => {
  it('未設定のキーは空文字を返す', async () => {
    expect(await queryClientConfig('unknown_key')).toBe('');
  });

  it('同じキーに保存すると上書きされる (UPSERT)', async () => {
    await updateClientConfig('some_key', 'first');
    await updateClientConfig('some_key', 'second');
    expect(await queryClientConfig('some_key')).toBe('second');
  });
});

describe('アバターのソート順設定 (H1)', () => {
  it('未設定なら Updated を返す', async () => {
    expect(await loadAvatarSortOrder()).toBe('Updated');
  });

  it('保存したソート順が復元される', async () => {
    await saveAvatarSortOrder('Name');
    expect(await loadAvatarSortOrder()).toBe('Name');
  });

  it('不正な値が保存されていたら Updated にフォールバックする', async () => {
    await updateClientConfig('avatar_sort_order', 'Bogus');
    expect(await loadAvatarSortOrder()).toBe('Updated');
  });

  it('null を保存すると Updated として保存される', async () => {
    await saveAvatarSortOrder(null);
    expect(await loadAvatarSortOrder()).toBe('Updated');
  });
});

describe('カード画像サイズ設定 (H2)', () => {
  it('未設定なら 160 を返す', async () => {
    expect(await loadCardImageSize()).toBe(160);
  });

  it('保存したサイズが復元される', async () => {
    await saveCardImageSize(240);
    expect(await loadCardImageSize()).toBe(240);
  });

  it('数値でない値が保存されていたら 160 にフォールバックする', async () => {
    await updateClientConfig('card_image_size', 'not-a-number');
    expect(await loadCardImageSize()).toBe(160);
  });

  it('null を保存すると 160 として保存される', async () => {
    await saveCardImageSize(null);
    expect(await loadCardImageSize()).toBe(160);
  });
});

describe('1 行あたりのカード数設定 (H3)', () => {
  it('未設定なら 3 を返す', async () => {
    expect(await loadCardNumberPerRow()).toBe(3);
  });

  it('保存した値が復元される', async () => {
    await saveCardNumberPerRow(5);
    expect(await loadCardNumberPerRow()).toBe(5);
  });

  it('数値でない値が保存されていたら 3 にフォールバックする', async () => {
    await updateClientConfig('card_number_per_row', 'not-a-number');
    expect(await loadCardNumberPerRow()).toBe(3);
  });
});
