# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- タグ追加時に選べる色を追加
- タグの名称と色を変更できるように修正

[Unreleased]: https://github.com/pluslatte/vrc-avatar-switcher/compare/v0.3.1...HEAD

## [0.3.1]
### Changed
- ライセンスを変更

[0.3.1]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.3.1

## [0.3.0]
### Added
- 文字列で表示するアバターを絞り込む機能を追加
- アバターのタグを一括編集できるように変更

### Fixed
- 認証情報が期限切れした場合、ログイン画面に戻らなかったのを修正

[0.3.0]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.3.0

## [0.2.0]
### Changed
- 認証情報を Store ではなくデータベースに保存するように変更
- アプリの設定は Store ではなくデータベースに保存するように変更

### Removed
- Store プラグインの使用を停止

### Fixed
- 起動に失敗することがあるのを修正

[0.2.0]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.2.0

## [0.1.2]
### Changed
- ログインフォームの Input を TextInput, PasswordInput へ変更

### Fixed
- 電子メールによる二段階認証のコマンド呼び出しで、与えるパラメータの名前に誤りがあったのを修正

[0.1.2]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.1.2

## [0.1.1]
### Added
- ログインに失敗した際の視覚的なフィードバック
- 使用中のアバターに枠線を表示 (thanks [Azukimochi](https://github.com/Azukimochi) !)

### Changed
- 視認性のため、アバターへのタグの紐づけを解除するボタンの色を白色に変更
- アバター一覧でアバター名がはみ出した場合、省略するように変更
- 使用中のアバター画像が完全に隠れないように変更 (thanks [Azukimochi](https://github.com/Azukimochi) !)
- ログアウトボタンを、間違えて押しにくい位置へ移動
- アバター一覧の更新ボタンの位置を移動

[0.1.1]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.1.1

## [0.1.0] - 2025-09-15
### Added
- 使用可能なアバターの取得および表示
- 選択したアバターへの変更
- アバターへのタグの紐づけ/解除
- タグをもとにした使用可能なアバターの絞り込み
- アバター取得順の切り替え
- 任意でのアバター一覧の更新
- タグ削除
- アバター一覧の表示サイズの調整
- ログイン/ログアウト

[0.1.0]: https://github.com/pluslatte/vrc-avatar-switcher/releases/tag/v0.1.0