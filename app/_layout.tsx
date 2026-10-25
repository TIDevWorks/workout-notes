import { initializeUser } from '@/helper/initializeUser';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// 初期化（フォント読み込み・ログイン）が終わるまでスプラッシュ画面を表示し続ける
SplashScreen.preventAutoHideAsync();

/**
 * アプリ全体のルートレイアウト。
 * 起動時に匿名ログインと初回データ登録を行い、完了してから画面を表示する。
 * そのため配下の画面では、ログイン済みであることを前提にできる。
 */
export default function RootLayout() {
  const [loaded, error] = useFonts(FontAwesome.font);
  const [isInitialized, setIsInitialized] = useState(false);
  // リトライのたびに増やして初期化処理を再実行する
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (error) throw error;

        if (loaded) {
          await initializeUser();
          setIsInitialized(true);
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        // 通信エラーなど。スプラッシュ画面のままアラートを出し、リトライで再実行する
        console.error('App initialization error:', e);
        Alert.alert(
          'エラー',
          'アプリの初期化に失敗しました。通信環境を確認して、もう一度お試しください。',
          [{ text: 'リトライ', onPress: () => setAttempt((n) => n + 1) }],
        );
      }
    };

    initializeApp();
  }, [loaded, error, attempt]);

  if (!loaded || !isInitialized) {
    return null;
  }

  // 画面の登録。タブ以外の画面（モーダル・引き継ぎ・ポリシー）はタブの上に重ねて表示する
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen
          name="modals/WorkoutList"
          options={{
            title: 'Select Workout',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="logs/[id]"
          options={{ title: '記録の編集', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="trainings/index"
          options={{ title: '種目の管理', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="trainings/new"
          options={{ title: '種目の追加', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="trainings/[id]"
          options={{ title: '種目の編集', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="transfer/issue"
          options={{ title: '引き継ぎコードの発行', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="transfer/redeem"
          options={{ title: '引き継ぎコードの入力', headerBackTitle: '戻る' }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{ title: 'プライバシーポリシー', headerBackTitle: '戻る' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
