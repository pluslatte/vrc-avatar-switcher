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
  it('作成したタグが名前と色つきで一覧に現れる (E1)', async () => {
    await createTag('かわいい', userA, '#ff0000');
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: 'かわいい', color: '#ff0000' }]);
  });

  it('同名タグを同じユーザーで二重作成するとエラーになる (E5)', async () => {
    await createTag('かわいい', userA, '#ff0000');
    await expect(createTag('かわいい', userA, '#00ff00'))
      .rejects.toThrow('タグ名「かわいい」は既に存在します');
  });

  it('別ユーザーなら同名タグを作成できる (I1)', async () => {
    await createTag('かわいい', userA, '#ff0000');
    await expect(createTag('かわいい', userB, '#0000ff')).resolves.not.toThrow();
    expect(await queryTagExists('かわいい', userB)).toBe(true);
  });

  it('タグ一覧は自分のタグだけ返る (I1)', async () => {
    await createTag('Aのタグ', userA, '#ff0000');
    await createTag('Bのタグ', userB, '#0000ff');
    const tagsOfA = await queryAllTagsAvailable(userA);
    expect(tagsOfA).toEqual([{ display_name: 'Aのタグ', color: '#ff0000' }]);
  });

  it('queryTagExists は他ユーザーのタグに反応しない (I1)', async () => {
    await createTag('かわいい', userA, '#ff0000');
    expect(await queryTagExists('かわいい', userB)).toBe(false);
  });
});

describe('updateTag', () => {
  it('タグ名と色を変更できる (F1)', async () => {
    await createTag('旧名', userA, '#ff0000');
    await updateTag('旧名', '新名', '#00ff00', userA);
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: '新名', color: '#00ff00' }]);
  });

  it('リネームすると付与済みアバターの関連付けも追従する (F1, ON UPDATE CASCADE)', async () => {
    await createTag('旧名', userA, '#ff0000');
    await createTagRelation('旧名', 'avtr_1', userA);
    await updateTag('旧名', '新名', '#ff0000', userA);
    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: '新名', color: '#ff0000' }]);
  });

  it('既存タグ名へのリネームはエラーになる (F2)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTag('タグ2', userA, '#00ff00');
    await expect(updateTag('タグ1', 'タグ2', '#ff0000', userA))
      .rejects.toThrow('タグ名「タグ2」は既に存在します');
  });

  it('名前を変えずに色だけ変更できる (F1)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await updateTag('タグ1', 'タグ1', '#00ff00', userA);
    const tags = await queryAllTagsAvailable(userA);
    expect(tags).toEqual([{ display_name: 'タグ1', color: '#00ff00' }]);
  });
});

describe('dropTag', () => {
  it('タグを削除すると全アバターからの関連付けも消える (F4, ON DELETE CASCADE)', async () => {
    await createTag('消すタグ', userA, '#ff0000');
    await createTagRelation('消すタグ', 'avtr_1', userA);
    await createTagRelation('消すタグ', 'avtr_2', userA);

    await dropTag('消すタグ', userA);

    expect(await queryTagExists('消すタグ', userA)).toBe(false);
    expect(await countTagRelationsOf('消すタグ', userA)).toBe(0);
    expect(await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA)).toEqual({});
  });

  it('別ユーザーの同名タグと関連付けには影響しない (I1)', async () => {
    await createTag('共通名', userA, '#ff0000');
    await createTag('共通名', userB, '#0000ff');
    await createTagRelation('共通名', 'avtr_1', userB);

    await dropTag('共通名', userA);

    expect(await queryTagExists('共通名', userB)).toBe(true);
    expect(await countTagRelationsOf('共通名', userB)).toBe(1);
  });
});

describe('createTagRelation / dropTagRelation / countTagRelationsOf', () => {
  it('タグを付与するとアバターのタグとして取得できる (E2)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTagRelation('タグ1', 'avtr_1', userA);
    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: 'タグ1', color: '#ff0000' }]);
  });

  it('同じ付与を繰り返しても重複もエラーも起きない (E3 の基盤)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTagRelation('タグ1', 'avtr_1', userA);
    await expect(createTagRelation('タグ1', 'avtr_1', userA)).resolves.not.toThrow();
    expect(await countTagRelationsOf('タグ1', userA)).toBe(1);
  });

  it('存在しないタグへの付与は外部キー違反で失敗する', async () => {
    await expect(createTagRelation('存在しないタグ', 'avtr_1', userA)).rejects.toThrow();
  });

  it('関連付けを外すとカウントが減り、最後の 1 件を外すと 0 になる (F5/F6 の判定材料)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTagRelation('タグ1', 'avtr_1', userA);
    await createTagRelation('タグ1', 'avtr_2', userA);

    await dropTagRelation('タグ1', 'avtr_1', userA);
    expect(await countTagRelationsOf('タグ1', userA)).toBe(1);

    await dropTagRelation('タグ1', 'avtr_2', userA);
    expect(await countTagRelationsOf('タグ1', userA)).toBe(0);
    // タグ自体は残る（自動削除はフック層の責務）
    expect(await queryTagExists('タグ1', userA)).toBe(true);
  });
});

describe('fetchAvatarsTags', () => {
  it('avatarIds が空なら空オブジェクトを返す', async () => {
    expect(await fetchAvatarsTags([], userA)).toEqual({});
  });

  it('アバターごとにタグがグルーピングされ、タグなしアバターはキーを持たない', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTag('タグ2', userA, '#00ff00');
    await createTagRelation('タグ1', 'avtr_1', userA);
    await createTagRelation('タグ2', 'avtr_1', userA);
    await createTagRelation('タグ1', 'avtr_2', userA);

    const relations = await fetchAvatarsTags(['avtr_1', 'avtr_2', 'avtr_3'], userA);

    expect(relations['avtr_1']).toEqual(expect.arrayContaining([
      { display_name: 'タグ1', color: '#ff0000' },
      { display_name: 'タグ2', color: '#00ff00' },
    ]));
    expect(relations['avtr_1']).toHaveLength(2);
    expect(relations['avtr_2']).toEqual([{ display_name: 'タグ1', color: '#ff0000' }]);
    expect(relations['avtr_3']).toBeUndefined();
  });

  it('他ユーザーの関連付けは含まれない (I1)', async () => {
    await createTag('タグ1', userA, '#ff0000');
    await createTagRelation('タグ1', 'avtr_1', userA);
    await createTag('タグB', userB, '#0000ff');
    await createTagRelation('タグB', 'avtr_1', userB);

    const relations = await fetchAvatarsTags(['avtr_1'], userA);
    expect(relations['avtr_1']).toEqual([{ display_name: 'タグ1', color: '#ff0000' }]);
  });
});
