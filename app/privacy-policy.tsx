import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/Colors';
import {
  PRIVACY_POLICY_UPDATED_AT,
  privacyPolicySections,
} from '@/constants/privacyPolicy';

export default function PrivacyPolicy() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {privacyPolicySections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.heading}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
      <Text
        style={styles.updatedAt}
      >{`${PRIVACY_POLICY_UPDATED_AT} 制定`}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    gap: 6,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Palette.text,
  },
  updatedAt: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'right',
  },
});
