# Workout Notes

筋トレの記録アプリです。カレンダーで日付を選んで種目・重量・回数・セット数を記録し、グラフで振り返れます。

- **Calendar**: 日付ごとの記録の一覧、記録の追加・編集・削除
- **Chart**: 今月の要約、週ごとのトレーニング日数、種目別の記録回数
- **Other**: 種目の管理（追加・編集・削除）、機種変更用の引き継ぎコード、アプリ情報

## 技術スタック

| 分類           | 使っているもの                                                        |
| -------------- | --------------------------------------------------------------------- |
| フレームワーク | [Expo](https://expo.dev/) SDK 58 / React Native 0.88 / React 19       |
| 画面遷移       | expo-router（ファイルベースのルーティング）                           |
| バックエンド   | Firebase（Authentication: 匿名 + メール/パスワード、Cloud Firestore） |
| カレンダー     | react-native-calendars                                                |
| 言語・品質     | TypeScript、ESLint 9 + Prettier、Jest                                 |

## セットアップ

### 1. 必要なもの

- Node.js（v22 で動作確認済み）
- スマホの [Expo Go](https://expo.dev/go)（動作確認用）
- Firebase プロジェクト

### 2. 依存パッケージのインストール

```sh
npm install
```

### 3. Firebase の設定

[Firebase コンソール](https://console.firebase.google.com/)で以下を設定します。

1. **Web アプリを追加する**（プロジェクトの設定 → マイアプリ）。React Native でも Firebase JS SDK を使うため、Web アプリの設定値を使います。
2. **Authentication** → Sign-in method で次の2つを有効にする
   - **匿名**（起動時に自動でログインするため）
   - **メール/パスワード**（引き継ぎコードのため）
3. **Firestore Database** を作成し、「ルール」に [`firestore.rules`](./firestore.rules) の内容を貼り付けて公開する（本人のデータだけ読み書きできるルール）

### 4. 環境変数（`.env`）

プロジェクトのルートに `.env` を作成し、Firebase の Web アプリの `firebaseConfig` の値を設定します。`.env` は Git の管理外です。

```sh
EXPO_PUBLIC_FB_API_KEY=
EXPO_PUBLIC_FB_PROJECT_ID=
EXPO_PUBLIC_FB_STORAGE_BUCKET=
EXPO_PUBLIC_FB_MESSAGINGSENDER_ID=
EXPO_PUBLIC_FB_APP_ID=
```

### 5. 起動

```sh
npx expo start -c
```

表示された QR コードを Expo Go で読み取ると起動します。`EXPO_PUBLIC_` の環境変数はビルド時に埋め込まれるため、`.env` を変えたら `-c`（キャッシュ削除）を付けて起動し直してください。

> アプリのアイコン・スプラッシュ画面・アプリ名は、Expo Go では反映されません。確認するときは開発ビルド（`npx expo run:android`）か EAS Build を使ってください。

## コマンド

| コマンド                          | 内容                                     |
| --------------------------------- | ---------------------------------------- |
| `npm start`                       | 開発サーバーを起動する                   |
| `npm run android` / `npm run web` | Android / Web で起動する                 |
| `npm test`                        | テストを1回実行する                      |
| `npm run test:watch`              | ファイルの変更を監視してテストを実行する |
| `npx tsc --noEmit`                | 型チェック                               |
| `npx eslint .`                    | Lint（`--fix` で自動修正）               |
| `npx expo-doctor`                 | Expo の設定・依存関係のチェック          |

コードを変えたら、コミットの前に `npm test`・`npx tsc --noEmit`・`npx eslint .` が通ることを確認してください。

## ディレクトリ構成

```
app/                      画面（expo-router のルーティング。ファイル = 画面）
  _layout.tsx             ルートレイアウト（起動時のログイン・初期データ登録、画面の登録）
  (tabs)/                 タブ画面
    index.tsx             Calendar
    ChartPage.tsx         Chart
    OtherPage.tsx         Other
  modals/WorkoutList.tsx  Select Workout（種目を選んで記録する）
  logs/[id].tsx           記録の編集・削除
  trainings/              種目の管理（一覧・追加・編集）
  transfer/               引き継ぎコードの発行・入力
  privacy-policy.tsx      プライバシーポリシー
components/               画面の部品（カレンダー、グラフ、フォームなど）
constants/                型定義・色・プライバシーポリシーの文面
helper/                   Firestore の読み書き、日付の計算、入力の検証など
  __tests__/              ユニットテスト
hooks/                    データを購読する React フック
firebaseConfig.ts         Firebase の初期化
firestore.rules           Firestore のセキュリティルール
```

テストファイルは `app/` の中に置かないでください（expo-router が画面として扱います）。

## データ構造（Firestore）

```
users/{uid}                     ユーザー（initialized, defaultsVersion, createdAt）
  trainingList/{trainingId}     種目（name, category, defaultWeight, defaultReps, defaultSets, order, custom, edited, deleted）
  workoutLogs/{logId}           記録（date: YYYY-MM-DD, trainingId, trainingName, category, weight, reps, sets, createdAt）
```

- **ユーザー**: 起動時に匿名ログインし、Firebase Auth の `uid` でデータを分けています。
- **種目の削除**は論理削除（`deleted: true`）です。過去の記録の種目名を表示するため、データは残します。
- **記録**には記録した時点の種目名（`trainingName`）も保存します。表示は種目の今の名前を優先します。

## 仕組みのメモ

### デフォルト種目の更新

デフォルト種目は [`helper/generateDefaultWorkouts.ts`](./helper/generateDefaultWorkouts.ts) で定義しています。種目を追加・変更したら `DEFAULT_TRAININGS_VERSION` を1上げてください。既存ユーザーにも次回の起動時に反映されます（ユーザーが編集・削除した種目は上書きしません）。記録が種目 ID を参照しているため、**既存の種目 ID は変えないでください**。

### 引き継ぎコード

Google アカウントなどを使わずに機種変更できるよう、匿名アカウントに「ID + パスワード」（Firebase のメール/パスワード認証）を紐づけています。

- メールアドレスは `{ID}@transfer.invalid`（登録できない予約済みドメイン）で、ユーザーには見えません。
- 新しい端末で同じ ID + パスワードでログインすると同じ `uid` になり、データをそのまま使えます。
- 発行したコードは端末の安全な領域（expo-secure-store）に保存し、再表示・再発行に使います。

詳しくは [`helper/transfer.ts`](./helper/transfer.ts) を参照してください。

## 既知の課題

- **オフラインに弱い**: Firestore の JS SDK は React Native ではデータを端末に永続化できないため、圏外では起動時の初期化に失敗します。
- **`npm audit` で 4 件（high）の警告**: 原因の `node-forge` に修正版がまだありません。Expo CLI 内の iOS / EAS Update のコード署名でのみ使われ、アプリには含まれません。修正版が出たら `npm update` で解消できる見込みです。
- iOS 向けのリリースは予定していないため、iOS の `bundleIdentifier` は設定していません。
