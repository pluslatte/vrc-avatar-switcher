import { invoke } from '@tauri-apps/api/core';
import {
  loadAvatarSortOrder,
  loadCardImageSize,
  loadCardColumnSpan,
  queryClientConfig,
  saveAvatarSortOrder,
  saveCardImageSize,
  saveCardColumnSpan,
  updateClientConfig,
} from '@/lib/db';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

beforeEach(() => {
  const values = new Map<string, string>();
  vi.mocked(invoke).mockImplementation(async (command, args) => {
    if (command === 'command_query_client_config') {
      const { key } = args as { key: string };
      return values.get(key) ?? '';
    }
    const { key, value } = args as { key: string; value: string };
    values.set(key, value);
  });
});

describe('queryClientConfig / updateClientConfig', () => {
  it('returns an empty string for an unset key', async () => {
    expect(await queryClientConfig('unknown_key')).toBe('');
  });

  it('overwrites an existing value for the same key (UPSERT)', async () => {
    await updateClientConfig('some_key', 'first');
    await updateClientConfig('some_key', 'second');
    expect(await queryClientConfig('some_key')).toBe('second');
  });
});

describe('avatar sort order setting (H1)', () => {
  it('defaults to Updated when unset', async () => {
    expect(await loadAvatarSortOrder()).toBe('Updated');
  });

  it('restores the saved sort order', async () => {
    await saveAvatarSortOrder('Name');
    expect(await loadAvatarSortOrder()).toBe('Name');
  });

  it('falls back to Updated for an invalid stored value', async () => {
    await updateClientConfig('avatar_sort_order', 'Bogus');
    expect(await loadAvatarSortOrder()).toBe('Updated');
  });

});

describe('card image size setting (H2)', () => {
  it('defaults to 160 when unset', async () => {
    expect(await loadCardImageSize()).toBe(160);
  });

  it('restores the saved image size', async () => {
    await saveCardImageSize(240);
    expect(await loadCardImageSize()).toBe(240);
  });

  it('falls back to 160 for a nonnumeric stored value', async () => {
    await updateClientConfig('card_image_size', 'not-a-number');
    expect(await loadCardImageSize()).toBe(160);
  });

});

describe('card column span setting (H3)', () => {
  it('defaults to 3 when unset', async () => {
    expect(await loadCardColumnSpan()).toBe(3);
  });

  it('restores the saved value', async () => {
    await saveCardColumnSpan(5);
    expect(await loadCardColumnSpan()).toBe(5);
  });

  it('falls back to 3 for a nonnumeric stored value', async () => {
    await updateClientConfig('card_number_per_row', 'not-a-number');
    expect(await loadCardColumnSpan()).toBe(3);
  });
});
