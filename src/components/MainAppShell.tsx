/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>. 
*/

import AvatarList from '@/components/avatar/AvatarList';
import { useAvatarSwitcher } from '@/hooks/useAvatarSwitcher';
import { Alert, AppShell, LoadingOverlay, ScrollArea } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import HeaderContents from '@/components/header/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import FooterContents from '@/components/footer/FooterContents';
import { useCardImageSizeSelector } from '@/hooks/useCardImageSizeSelector';
import { useCardNumberPerRowSelector } from '@/hooks/useCardNumberPerRowSelector';
import { isAvatarSortOrder } from '@/lib/models';
import { useState } from 'react';
import { useAvatarSearchByName } from '@/hooks/useAvatarSearchByName';

interface DashBoardProps {
  onLogoutSuccess: () => void;
}
const MainAppShell = (props: DashBoardProps) => {
  const {
    avatarListQuery,
    switchAvatarMutation,
    avatarSortOrder,
    tagsLoading,
    availableTags,
    tagAvatarRelationLoading,
    tagAvatarRelation,
    handleAvatarSortOrderChange,
    handlerAvatarSwitch,
  } = useAvatarSwitcher();
  const { loading: cardImageSizeLoading, cardImageSize, handleCardImageSizeChange } = useCardImageSizeSelector();
  const { loading: cardNumberPerRowLoading, cardNumberPerRow, handleCardNumberPerRow } = useCardNumberPerRowSelector();
  const { avatarSearchQueryValueDeferred, setAvatarSearchQueryValue } = useAvatarSearchByName();
  const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

  const handlerSortOptSwitch = (option: string | null) => {
    if (isAvatarSortOrder(option)) {
      handleAvatarSortOrderChange(option);
    }
  };

  if (avatarListQuery.isPending || avatarListQuery.isFetching) return <LoaderFullWindow message="アバターを読み込んでいます..." />;
  if (avatarSortOrder === undefined) return <div>Error AvatarSortOrder: avatarSortOrder is undefined</div>;

  // エラー時でも前回のキャッシュデータを使用（初回エラー時は空データ）
  const avatars = avatarListQuery.data?.avatars || [];
  const currentUser = avatarListQuery.data?.currentUser || { id: '', displayName: '', currentAvatar: '', currentAvatarThumbnailImageUrl: '' };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      footer={{ height: 60 }}
    >
      <AppShell.Header>
        <HeaderContents
          avatarSortOrder={avatarSortOrder}
          currentUserDisplayName={currentUser.displayName}
          currentUserThumbnailImageUrl={currentUser.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={avatars.find(avatar => avatar.id === currentUser.currentAvatar)?.name || 'No Avatar'}
        />
      </AppShell.Header>

      <AppShell.Main>
        {avatarListQuery.isError && avatarListQuery.data && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="最新データの取得に失敗しました"
            color="orange"
            mb="md"
          >
            前回のデータを表示しています。ヘッダーのリフレッシュボタンから再試行できます。
          </Alert>
        )}
        {cardImageSize === undefined || cardNumberPerRow === undefined &&
          <LoaderFullWindow message="設定を読み込んでいます..." />}
        {cardImageSize !== undefined && cardNumberPerRow !== undefined &&
          <AvatarList
            avatars={avatars}
            tagAvatarRelation={tagAvatarRelation}
            tagAvatarRelationLoading={tagAvatarRelationLoading}
            currentUser={currentUser}
            pendingSwitch={switchAvatarMutation.isPending}
            searchQuery={avatarSearchQueryValueDeferred}
            cardImageSize={cardImageSize}
            cardNumberPerRow={cardNumberPerRow}
            selectedTags={selectedTags}
            handlerAvatarSwitch={handlerAvatarSwitch}
          />}
      </AppShell.Main>

      <AppShell.Footer>
        <ScrollArea h="100%">
          {<LoadingOverlay visible={tagsLoading} overlayProps={{ radius: 'md', blur: 2 }} />}
          {availableTags !== undefined && (
            <FooterContents
              avatars={avatars}
              currentUser={currentUser}
              selectedSort={avatarSortOrder}
              updateAvatarSearchInputString={setAvatarSearchQueryValue}
              cardImageSize={cardImageSize}
              cardImageSizeLoading={cardImageSizeLoading}
              cardNumberPerRow={cardNumberPerRow}
              cardNumberPerRowLoading={cardNumberPerRowLoading}
              availableTags={availableTags}
              setCardImageSize={handleCardImageSizeChange}
              setCardNumberPerRow={handleCardNumberPerRow}
              onSortSettingChange={handlerSortOptSwitch}
              onTagFilterChange={setSelectedTags}
              onLogoutSuccess={props.onLogoutSuccess}
            />
          )}
        </ScrollArea>
      </AppShell.Footer>

    </AppShell>
  );
};

export default MainAppShell;