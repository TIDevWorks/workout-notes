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

SplashScreen.preventAutoHideAsync();

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
      </Stack>
    </ThemeProvider>
  );
}
