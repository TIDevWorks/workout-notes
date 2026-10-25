import { StyleSheet, Text, View } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';

type StatTileProps = {
  label: string;
  /** null のときは「-」を表示する（データがない場合） */
  value: number | null;
  unit: string;
  /** 前の期間との差（例: 先月比） */
  delta?: { value: number; period: string };
  /** 値の下に出す補足（delta の代わりに使う） */
  caption?: string;
};

const formatDelta = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** 1つの数値を大きく見せるカード（ラベル・値・前期間との差または補足） */
export default function StatTile({
  label,
  value,
  unit,
  delta,
  caption,
}: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value ?? '-'}</Text>
        {value !== null && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {delta && (
        <Text style={styles.sub}>
          {`${delta.period} ${formatDelta(delta.value)}`}
        </Text>
      )}
      {caption && (
        <Text style={styles.sub} numberOfLines={1}>
          {caption}
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
  sub: {
    fontSize: 11,
    color: Palette.textMuted,
  },
});
