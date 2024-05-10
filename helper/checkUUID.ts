import { generateDefaultWorkouts } from "@/helper/generateDefaultWorkouts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

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
    // 初回アプリ起動時、デフォルトのトレーニング種目を生成
    await generateDefaultWorkouts();
  } catch (e) {
    console.error(e);
    showAlert("UUIDの生成と保存に失敗しました。アプリを再起動してください。");
  }
};

export const checkUUID = async () => {
  try {
    const value = await AsyncStorage.getItem("@uuid");
    if (value === null) {
      generateAndStoreUUID();
    }
  } catch (e) {
    console.error(e);
    showAlert("UUIDの確認に失敗しました。アプリを再起動してください。");
  }
};
