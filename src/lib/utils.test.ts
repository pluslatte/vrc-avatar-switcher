import { avatarTagSearchfilterAvatars } from './utils';

describe('avatarTagSearchFilterAvatars', () => {
  it('returns all avatars when no tags are selected', () => {
    const avatars = [
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const selectedTags: string[] = [];
    const tagAvatarRelation = {
      '1': [{ display_name: 'tag1', color: 'red' }],
      '2': [{ display_name: 'tag2', color: 'blue' }],
    };
    const result = avatarTagSearchfilterAvatars(avatars, selectedTags, tagAvatarRelation);
    expect(result).toEqual(avatars);
  });

  it('filters avatars by selected tags', () => {
    const avatars = [
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'Avatar 3', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const selectedTags = ['tag1'];
    const tagAvatarRelation = {
      '1': [{ display_name: 'tag1', color: 'red' }],
      '2': [{ display_name: 'tag2', color: 'blue' }],
      '3': [{ display_name: 'tag1', color: 'green' }],
    };
    const result = avatarTagSearchfilterAvatars(avatars, selectedTags, tagAvatarRelation);
    expect(result).toEqual([
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'Avatar 3', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });
});