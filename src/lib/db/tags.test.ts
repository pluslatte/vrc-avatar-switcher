import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import {
  countTagRelationsOf,
  createTag,
  createTagRelation,
  dropTag,
  dropTagRelation,
  fetchAvatarsTags,
  queryAllTagsAvailable,
  queryTagExists,
  updateTag,
} from '@/lib/db';

let db: TestDb;

vi.mock('@/lib/db/client', () => ({
  getDb: async () => db,
}));

const userA = 'usr_aaaa';
const userB = 'usr_bbbb';

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe('createTag / queryTagExists / queryAllTagsAvailable', () => {
  it('lists a created tag with its name and color (E1)', async () => {
    await createTag('Cute', userA, '#ff0000');
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: 'Cute', color: '#ff0000' }]);
  });

  it('rejects duplicate tag names for the same user (E5)', async () => {
    await createTag('Cute', userA, '#ff0000');
    await expect(createTag('Cute', userA, '#00ff00'))
      .rejects.toThrow('タグ名「Cute」は既に存在します');
  });

  it('allows different users to create tags with the same name (I1)', async () => {
    await createTag('Cute', userA, '#ff0000');
    await expect(createTag('Cute', userB, '#0000ff')).resolves.not.toThrow();
    expect(await queryTagExists('Cute', userB)).toBe(true);
  });

  it('lists only the current user\'s tags (I1)', async () => {
    await createTag('Tag A', userA, '#ff0000');
    await createTag('Tag B', userB, '#0000ff');
    const tagsOfA = await queryAllTagsAvailable(userA);
    expect(tagsOfA).toEqual([{ display_name: 'Tag A', color: '#ff0000' }]);
  });

  it('does not find another user\'s tag with queryTagExists (I1)', async () => {
    await createTag('Cute', userA, '#ff0000');
    expect(await queryTagExists('Cute', userB)).toBe(false);
  });
});

describe('updateTag', () => {
  it('updates the tag name and color (F1)', async () => {
    await createTag('Old name', userA, '#ff0000');
    await updateTag('Old name', 'New name', '#00ff00', userA);
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: 'New name', color: '#00ff00' }]);
  });

  it('preserves avatar assignments when renaming a tag (F1, ON UPDATE CASCADE)', async () => {
    await createTag('Old name', userA, '#ff0000');
    await createTagRelation('Old name', 'avtr_1', userA);
    await updateTag('Old name', 'New name', '#ff0000', userA);
    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: 'New name', color: '#ff0000' }]);
  });

  it('rejects renaming a tag to an existing name (F2)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTag('Tag 2', userA, '#00ff00');
    await expect(updateTag('Tag 1', 'Tag 2', '#ff0000', userA))
      .rejects.toThrow('タグ名「Tag 2」は既に存在します');
  });

  it('updates the color without changing the name (F1)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await updateTag('Tag 1', 'Tag 1', '#00ff00', userA);
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: 'Tag 1', color: '#00ff00' }]);
  });
});

describe('dropTag', () => {
  it('removes all avatar assignments when deleting a tag (F4, ON DELETE CASCADE)', async () => {
    await createTag('Deleted tag', userA, '#ff0000');
    await createTagRelation('Deleted tag', 'avtr_1', userA);
    await createTagRelation('Deleted tag', 'avtr_2', userA);

    await dropTag('Deleted tag', userA);

    expect(await queryTagExists('Deleted tag', userA)).toBe(false);
    expect(await countTagRelationsOf('Deleted tag', userA)).toBe(0);
    expect(await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA)).toEqual({});
  });

  it('preserves another user\'s tag and assignments with the same name (I1)', async () => {
    await createTag('Shared name', userA, '#ff0000');
    await createTag('Shared name', userB, '#0000ff');
    await createTagRelation('Shared name', 'avtr_1', userB);

    await dropTag('Shared name', userA);

    expect(await queryTagExists('Shared name', userB)).toBe(true);
    expect(await countTagRelationsOf('Shared name', userB)).toBe(1);
  });
});

describe('createTagRelation / dropTagRelation / countTagRelationsOf', () => {
  it('retrieves an assigned tag for its avatar (E2)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTagRelation('Tag 1', 'avtr_1', userA);
    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: 'Tag 1', color: '#ff0000' }]);
  });

  it('ignores repeated assignments without duplicates or errors (E3)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTagRelation('Tag 1', 'avtr_1', userA);
    await expect(createTagRelation('Tag 1', 'avtr_1', userA)).resolves.not.toThrow();
    expect(await countTagRelationsOf('Tag 1', userA)).toBe(1);
  });

  it('rejects assigning a nonexistent tag with a foreign key violation', async () => {
    await expect(createTagRelation('Missing tag', 'avtr_1', userA)).rejects.toThrow();
  });

  it('decreases the assignment count to zero after removing the last assignment (F5/F6)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTagRelation('Tag 1', 'avtr_1', userA);
    await createTagRelation('Tag 1', 'avtr_2', userA);

    await dropTagRelation('Tag 1', 'avtr_1', userA);
    expect(await countTagRelationsOf('Tag 1', userA)).toBe(1);

    await dropTagRelation('Tag 1', 'avtr_2', userA);
    expect(await countTagRelationsOf('Tag 1', userA)).toBe(0);
    expect(await queryTagExists('Tag 1', userA)).toBe(true);
  });
});

describe('fetchAvatarsTags', () => {
  it('returns an empty object for an empty avatar ID list', async () => {
    expect(await fetchAvatarsTags([], userA)).toEqual({});
  });

  it('groups tags by avatar and omits avatars without tags', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTag('Tag 2', userA, '#00ff00');
    await createTagRelation('Tag 1', 'avtr_1', userA);
    await createTagRelation('Tag 2', 'avtr_1', userA);
    await createTagRelation('Tag 1', 'avtr_2', userA);

    const relations = await fetchAvatarsTags(['avtr_1', 'avtr_2', 'avtr_3'], userA);

    expect(relations['avtr_1']).toEqual(expect.arrayContaining([
      { display_name: 'Tag 1', color: '#ff0000' },
      { display_name: 'Tag 2', color: '#00ff00' },
    ]));
    expect(relations['avtr_1']).toHaveLength(2);
    expect(relations['avtr_2']).toEqual([{ display_name: 'Tag 1', color: '#ff0000' }]);
    expect(relations['avtr_3']).toBeUndefined();
  });

  it('excludes other users\' assignments (I1)', async () => {
    await createTag('Tag 1', userA, '#ff0000');
    await createTagRelation('Tag 1', 'avtr_1', userA);
    await createTag('Tag B', userB, '#0000ff');
    await createTagRelation('Tag B', 'avtr_1', userB);

    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: 'Tag 1', color: '#ff0000' }]);
  });
});
