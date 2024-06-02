import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'theme';

// AsyncStorageからカラーテーマを取得
export const getTheme = async (): Promise<'light' | 'dark'> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    if (theme) {
      return theme as 'light' | 'dark';
    } else {
      const defaultTheme = 'light' as const;
      await AsyncStorage.setItem(THEME_KEY, defaultTheme);
      return defaultTheme;
    }
  } catch (error) {
    console.error('Failed to fetch the theme from storage:', error);
    return 'light';
  }
};

export const setTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save the theme to storage:', error);
  }
};
