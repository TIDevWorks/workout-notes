import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/Colors';

export type BarDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  /** 値の大きい順に並べたデータ */
  data: BarDatum[];
  unit: string;
};

/** 棒の太さ（ガイドラインの上限 24px 以下） */
const BAR_HEIGHT = 14;

/** 横棒グラフ（1系列）。各棒の先に値を表示する */
export default function BarChart({ data, unit }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.list}>
      {data.map((d) => (
        <View
          key={d.label}
          style={styles.row}
          accessible
          accessibilityLabel={`${d.label} ${d.value}${unit}`}
        >
          <Text style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { flex: d.value / maxValue }]} />
            {/* 値ラベルは固定幅にして、棒の長さが値に正しく比例するようにする */}
            <Text style={styles.value}>{`${d.value}${unit}`}</Text>
            <View style={{ flex: 1 - d.value / maxValue }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 104,
    fontSize: 13,
    color: Palette.text,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: BAR_HEIGHT,
    backgroundColor: Palette.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  value: {
    width: 40,
    paddingLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
});
