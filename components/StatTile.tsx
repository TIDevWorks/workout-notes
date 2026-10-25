import { StyleSheet, Text, View } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type StatTileProps = {
  label: string;
  value: number;
  unit: string;
  /** 前の期間との差（例: 先月比） */
  delta?: { value: number; period: string };
};

const formatDelta = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** 1つの数値を大きく見せるカード（ラベル・値・前期間との差） */
export default function StatTile({ label, value, unit, delta }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {delta && (
        <Text style={styles.delta}>
          {`${delta.period} ${formatDelta(delta.value)}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 4,
    ...Shadow.card,
  },
  label: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  delta: {
    fontSize: 11,
    color: Palette.textMuted,
  },
});
