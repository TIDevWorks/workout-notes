import { useColorScheme } from "@/components/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const showAlert = (errorMessage: string) => {
  Alert.alert("エラー", errorMessage, [
    {
      text: "OK",
      onPress: () => Updates.reloadAsync(),
    },
  ]);
};

const generateAndStoreUUID = async () => {
  const newUuid = await uuidv4();

  try {
    await AsyncStorage.setItem("@uuid", newUuid);
  } catch (e) {
    console.error(e);
    showAlert("UUIDの生成と保存に失敗しました。アプリを再起動してください。");
  }
};

const checkUUID = async () => {
  try {
    const value = await AsyncStorage.getItem("@uuid");
    console.log(value);
    if (value === null) {
      generateAndStoreUUID();
    }
  } catch (e) {
    console.error(e);
    showAlert("UUIDの確認に失敗しました。アプリを再起動してください。");
  }
};

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
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
