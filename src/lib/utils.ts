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

import { Avatar } from './models';

export const avatarTagSearchFilterAvatars = (
  avatars: Array<Avatar>,
  selectedTags: Array<string>,
  tagAvatarRelation: Record<string, Array<{ display_name: string; color: string }>> | undefined
): Array<Avatar> => (
  avatars.filter(avatar => {
    if (selectedTags.length === 0) {
      return true;
    }
    if (tagAvatarRelation === undefined) {
      return false;
    }
    const tags = tagAvatarRelation[avatar.id] || [];
    return selectedTags.every(tag => tags.some(t => t.display_name === tag));
  })
);

export const avatarNameSearchFilterAvatars = (
  avatars: Array<Avatar>,
  searchQuery: string,
): Array<Avatar> => (
  avatars.filter(avatar => {
    if (searchQuery.trim() === '') {
      return true;
    }
    return avatar.name.toLowerCase().includes(searchQuery.toLowerCase());
  })
);