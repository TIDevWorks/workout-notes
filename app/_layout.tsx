import { checkUUID } from "@/helper/checkUUID";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export {
  // Layoutコンポーネントによって投げられたエラーをキャッチする
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // modalでリロードしても戻るボタンが表示されるようにする
  initialRouteName: "(tabs)",
};

// アセットのロードが完了する前にスプラッシュ画面が自動で隠れないようにする
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // アプリ起動時にAsyncStrageにUUIDが存在するかチェック
  useEffect(() => {
    checkUUID();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modals/modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="modals/WorkoutList"
          options={{ presentation: "modal", title: "Select Workout" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
