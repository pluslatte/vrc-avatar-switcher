/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
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