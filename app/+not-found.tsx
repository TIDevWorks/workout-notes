import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/Colors';

/** 存在しない画面を開いたときに表示する画面 */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Palette.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: Palette.primary,
  },
});
