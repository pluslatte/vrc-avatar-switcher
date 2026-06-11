import { notifications } from '@mantine/notifications';
import { act, renderHook, waitFor } from '@testing-library/react';
import { countTagRelationsOf, createTag, fetchAvatarsTags, queryAllTagsAvailable, queryTagExists } from '@/lib/db';
import type { Tag } from '@/lib/models';
import { createTestDb, type TestDb } from '@/test/inMemoryDb';
import { createQueryWrapper, createTestQueryClient } from '@/test/testUtils';
import { useTagManager } from './useTagManager';

vi.mock('@/lib/db/client', () => ({
  getDb: async () => db,
}));

let db: TestDb;
const userA = 'usr_aaaa';

beforeEach(() => {
  vi.clearAllMocks();
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

const renderTagManager = (params: {
  avatarIds: Array<string>;
  tags?: Array<Tag>;
  tagAvatarRelation?: Record<string, Array<Tag>>;
}) =>
  renderHook(
    () => useTagManager({
      avatarIds: params.avatarIds,
      tags: params.tags ?? [],
      currentUserId: userA,
      tagAvatarRelation: params.tagAvatarRelation,
    }),
    { wrapper: createQueryWrapper(createTestQueryClient()) },
  );

describe('useTagManager', () => {
  it('新しいタグ名と色で作成すると、タグが作られ対象アバター全員に付与される (E1)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const { result } = renderTagManager({ avatarIds: ['avtr_1', 'avtr_2'] });

    act(() => {
      result.current.setNewTagName('新タグ');
      result.current.setNewTagColor('#ff0000');
    });
    act(() => {
      result.current.handleCreateNewTag();
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('新タグ', userA)).toBe(2);
    });
    expect(await queryAllTagsAvailable(userA)).toEqual([
      { display_name: '新タグ', color: '#ff0000' },
    ]);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ追加',
      message: 'タグ「新タグ」を2件のアバターに追加しました。',
    }));
    // 入力欄はクリアされる
    await waitFor(() => expect(result.current.newTagName).toBe(''));
  });

  it('既存タグをクリックすると、新規作成なしで対象アバターに付与される (E2)', async () => {
    await createTag('既存タグ', userA, '#00ff00');
    const { result } = renderTagManager({ avatarIds: ['avtr_1', 'avtr_2'] });

    act(() => {
      result.current.handleExistingTagClick('既存タグ', '#00ff00');
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('既存タグ', userA)).toBe(2);
    });
    // タグが二重に作られていない
    expect(await queryAllTagsAvailable(userA)).toHaveLength(1);
  });

  it('対象アバター全員に付与済みのタグは警告だけ出て何も起きない (E3)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const tag: Tag = { display_name: '付与済み', color: '#ff0000' };
    await createTag('付与済み', userA, '#ff0000');
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: { avtr_1: [tag], avtr_2: [tag] },
    });

    act(() => {
      result.current.handleExistingTagClick('付与済み', '#ff0000');
    });

    await waitFor(() => expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'タグ追加',
      message: 'タグ「付与済み」は対象のアバターにすでに割り当て済みです。',
      color: 'yellow',
    })));
    expect(await countTagRelationsOf('付与済み', userA)).toBe(0);
  });

  it('一部のアバターだけ未付与なら、未付与のアバターにだけ付与される (E4)', async () => {
    const tag: Tag = { display_name: '部分付与', color: '#ff0000' };
    await createTag('部分付与', userA, '#ff0000');
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: { avtr_1: [tag] },
    });

    act(() => {
      result.current.handleExistingTagClick('部分付与', '#ff0000');
    });

    await waitFor(async () => {
      expect(await countTagRelationsOf('部分付与', userA)).toBe(1);
    });
    const relations = await fetchAvatarsTags(['avtr_1', 'avtr_2'], userA);
    expect(relations['avtr_2']).toEqual([tag]);
  });

  it('タグ名が空（トリム後）のときは作成が実行されない (E6)', async () => {
    const showSpy = vi.spyOn(notifications, 'show');
    const { result } = renderTagManager({ avatarIds: ['avtr_1'] });

    act(() => {
      result.current.setNewTagName('   ');
    });
    act(() => {
      result.current.handleCreateNewTag();
    });

    expect(showSpy).not.toHaveBeenCalled();
    expect(await queryTagExists('   ', userA)).toBe(false);
  });

  it('選択中の全アバターが共通して持つタグだけが disabled になる', () => {
    const tagX: Tag = { display_name: 'X', color: '#111111' };
    const tagY: Tag = { display_name: 'Y', color: '#222222' };
    const tagZ: Tag = { display_name: 'Z', color: '#333333' };
    const { result } = renderTagManager({
      avatarIds: ['avtr_1', 'avtr_2'],
      tagAvatarRelation: {
        avtr_1: [tagX, tagY],
        avtr_2: [tagY, tagZ],
      },
    });

    expect(result.current.disabledTagNames).toEqual(['Y']);
  });
});
