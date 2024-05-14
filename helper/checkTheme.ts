import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'theme';

export const getTheme = async (): Promise<'light' | 'dark'> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return theme === 'dark' ? 'dark' : 'light'; // デフォルトは 'light'
  } catch (error) {
    console.error('Failed to fetch the theme from storage:', error);
    return 'light'; // エラーが発生した場合もデフォルトは 'light'
  }
};

export const setTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save the theme to storage:', error);
  }
};
