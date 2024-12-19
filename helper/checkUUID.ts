// checkUUID.ts
import { generateDefaultWorkouts } from '@/helper/generateDefaultWorkouts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const showAlert = (errorMessage: string) => {
  Alert.alert('エラー', errorMessage, [
    {
      text: 'リトライ',
      onPress: () => checkUUID(),
    },
  ]);
};

const generateAndStoreUUID = async () => {
  const newUuid = uuidv4();

  try {
    await AsyncStorage.setItem('@uuid', newUuid);
    await generateDefaultWorkouts(newUuid);
    return true;
  } catch (e) {
    console.error('UUID generation error:', e);
    showAlert('初期設定に失敗しました。もう一度試してください。');
    return false;
  }
};

export const checkUUID = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('@uuid');
    if (value === null) {
      return await generateAndStoreUUID();
    }
    return true;
  } catch (e) {
    console.error('UUID check error:', e);
    showAlert('UUIDの確認に失敗しました。もう一度試してください。');
    return false;
  }
};
