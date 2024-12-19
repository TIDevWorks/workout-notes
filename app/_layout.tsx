import { checkUUID } from '@/helper/checkUUID';
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
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (error) throw error;

        if (loaded) {
          const uuidCheckResult = await checkUUID();
          if (uuidCheckResult) {
            setIsInitialized(true);
            await SplashScreen.hideAsync();
          }
        }
      } catch (e) {
        console.error('App initialization error:', e);
        // クリティカルなエラーの場合のみユーザーに通知
        Alert.alert('エラー', 'アプリの初期化に失敗しました。');
      }
    };

    initializeApp();
  }, [loaded, error]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
