import AvatarList from '@/components/avatar/AvatarList';
import { Alert, AppShell, Button, Center, LoadingOverlay, ScrollArea, Stack, Text } from '@mantine/core';
import HeaderContents from '@/components/header/HeaderContents';
import { LoaderFullWindow } from '@/components/LoaderFullWindow';
import AvatarToolbar from '@/components/footer/AvatarToolbar';
import AuthStatusBar from '@/components/footer/AuthStatusBar';
import { useAvatarBrowser } from '@/hooks/useAvatarBrowser';
import { AuthStatus } from '@/lib/authStatus';

export interface MainAppShellProps {
  authStatus: AuthStatus;
  onLoginClick: () => void;
  onLogoutSuccess: () => void;
}
const MainAppShell = (props: MainAppShellProps) => {
  const isAuthenticated = props.authStatus === 'authenticated';
  const {
    avatarSortOrder, avatarListQuery, switchAvatarMutation,
    availableTagsQuery, tagAvatarsRelationQuery,
    cardImageSizeLoading, cardImageSize, setCardImageSize,
    cardColumnSpanLoading, cardColumnSpan, setCardColumnSpan,
    avatarSearchQueryValueDeferred, setAvatarSearchQueryValue,
    selectedTags, setSelectedTags, handleSortOrderChange,
  } = useAvatarBrowser(props.authStatus);

  const avatars = avatarListQuery.data?.avatars ?? [];
  const currentUser = avatarListQuery.data?.currentUser;
  const currentUserAvatarName = currentUser
    ? avatars.find(avatar => avatar.id === currentUser.currentAvatar)?.name || 'No Avatar'
    : '未取得';

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      footer={{ height: 88 }}
    >
      <AppShell.Header>
        <HeaderContents
          currentUserDisplayName={currentUser?.displayName ?? 'ユーザー未取得'}
          currentUserThumbnailImageUrl={currentUser?.currentAvatarThumbnailImageUrl}
          currentUserAvatarName={currentUserAvatarName}
        />
      </AppShell.Header>

      <AppShell.Main>
        {props.authStatus === 'checking' ? (
          <LoaderFullWindow message="認証状態を確認しています..." withAppShell={true} />
        ) : !isAuthenticated ? (
          <Center h="100%">
            <Stack align="center" gap="md">
              <Text c="dimmed">
                {props.authStatus === 'needs-reauth'
                  ? 'セッションの有効期限が切れています。再ログインしてください。'
                  : 'VRChat にログインすると、アバター一覧が表示されます。'}
              </Text>
              <Button onClick={props.onLoginClick}>
                {props.authStatus === 'needs-reauth' ? '再ログイン' : 'ログイン'}
              </Button>
            </Stack>
          </Center>
        ) : avatarSortOrder === undefined ? (
          <LoaderFullWindow message="設定を読み込んでいます..." withAppShell={true} />
        ) : avatarListQuery.isPending || avatarListQuery.isFetching ? (
          <LoaderFullWindow message="アバターを読み込んでいます..." withAppShell={true} />
        ) : avatarListQuery.isError ? (
          <Alert color="red" title="アバター一覧を読み込めませんでした">
            {avatarListQuery.error.message}
          </Alert>
        ) : (cardImageSize === undefined || cardColumnSpan === undefined) ? (
          <LoaderFullWindow message="設定を読み込んでいます..." withAppShell={true} />
        ) : (
          <AvatarList
            avatars={avatars}
            tagAvatarRelation={tagAvatarsRelationQuery.data}
            tagAvatarRelationLoading={tagAvatarsRelationQuery.isPending}
            currentUser={avatarListQuery.data.currentUser}
            pendingSwitch={switchAvatarMutation.isPending}
            searchQuery={avatarSearchQueryValueDeferred}
            cardImageSize={cardImageSize}
            cardColumnSpan={cardColumnSpan}
            selectedTags={selectedTags}
            handlerAvatarSwitch={switchAvatarMutation.mutate}
          />
        )}
      </AppShell.Main>

      <AppShell.Footer>
        <ScrollArea h={60}>
          <LoadingOverlay visible={isAuthenticated && availableTagsQuery.isPending} overlayProps={{ radius: 'md', blur: 2 }} />
          {currentUser !== undefined && avatarSortOrder !== undefined && availableTagsQuery.data !== undefined && (
            <AvatarToolbar
              currentUserId={currentUser.id}
              selectedSort={avatarSortOrder}
              updateAvatarSearchInputString={setAvatarSearchQueryValue}
              cardImageSize={cardImageSize}
              cardImageSizeLoading={cardImageSizeLoading}
              cardColumnSpan={cardColumnSpan}
              cardColumnSpanLoading={cardColumnSpanLoading}
              availableTags={availableTagsQuery.data}
              setCardImageSize={setCardImageSize}
              setCardColumnSpan={setCardColumnSpan}
              onSortSettingChange={handleSortOrderChange}
              onTagFilterChange={setSelectedTags}
              onLogoutSuccess={props.onLogoutSuccess}
            />
          )}
        </ScrollArea>
        <AuthStatusBar authStatus={props.authStatus} />
      </AppShell.Footer>

    </AppShell>
  );
};

export default MainAppShell;
