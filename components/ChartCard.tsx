import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  /** タイトル行の右側（表示切替など） */
  accessory?: ReactNode;
  children: ReactNode;
};

export default function ChartCard({
  title,
  subtitle,
  accessory,
  children,
}: ChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {accessory}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.textMuted,
  },
});
