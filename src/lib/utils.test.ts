/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { avatarTagSearchFilterAvatars, avatarNameSearchFilterAvatars } from './utils';

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
    const result = avatarTagSearchFilterAvatars(avatars, selectedTags, tagAvatarRelation);
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
    const result = avatarTagSearchFilterAvatars(avatars, selectedTags, tagAvatarRelation);
    expect(result).toEqual([
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'Avatar 3', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });
});

describe('avatarNameSearchFilterAvatars', () => {
  it('returns all avatars when search query is empty', () => {
    const avatars = [
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = '';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual(avatars);
  });

  it('returns all avatars when search query is only whitespace', () => {
    const avatars = [
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = '   ';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual(avatars);
  });

  it('filters avatars by name (case insensitive)', () => {
    const avatars = [
      { id: '1', name: 'Cute Cat Avatar', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Cool Dog Avatar', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'Catgirl Avatar', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = 'cat';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual([
      { id: '1', name: 'Cute Cat Avatar', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'Catgirl Avatar', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });

  it('filters avatars with uppercase search query', () => {
    const avatars = [
      { id: '1', name: 'Cute Cat Avatar', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Cool Dog Avatar', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = 'CAT';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual([
      { id: '1', name: 'Cute Cat Avatar', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });

  it('returns empty array when no avatars match', () => {
    const avatars = [
      { id: '1', name: 'Avatar 1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'Avatar 2', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = 'nonexistent';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual([]);
  });

  it('filters avatars with partial match', () => {
    const avatars = [
      { id: '1', name: 'MyAvatar_v1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'MyAvatar_v2', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'OtherAvatar', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = 'myavatar';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual([
      { id: '1', name: 'MyAvatar_v1', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'MyAvatar_v2', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });

  it('handles Japanese characters correctly', () => {
    const avatars = [
      { id: '1', name: 'かわいいアバター', imageUrl: '', thumbnailImageUrl: '' },
      { id: '2', name: 'かっこいいアバター', imageUrl: '', thumbnailImageUrl: '' },
      { id: '3', name: 'クールなアバター', imageUrl: '', thumbnailImageUrl: '' },
    ];
    const searchQuery = 'かわいい';
    const result = avatarNameSearchFilterAvatars(avatars, searchQuery);
    expect(result).toEqual([
      { id: '1', name: 'かわいいアバター', imageUrl: '', thumbnailImageUrl: '' },
    ]);
  });
});