import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/Colors';

export type ColumnDatum = {
  /** x 軸のラベル（例: 10/20） */
  label: string;
  /** 表・読み上げ用の詳しいラベル（例: 10/20〜10/26） */
  longLabel: string;
  value: number;
};

type ColumnChartProps = {
  data: ColumnDatum[];
  unit: string;
  /** 表で表示する */
  showTable: boolean;
};

/** 棒を描く領域の高さ（x 軸ラベルを除く） */
const PLOT_HEIGHT = 140;
/** 棒の太さ（ガイドラインの上限 24px 以下） */
const COLUMN_WIDTH = 20;
/** 目盛りの間隔 */
const TICK_STEP = 2;

/**
 * 縦棒グラフ（1系列）。棒をタップすると、その値を棒の上に表示する。
 * showTable が true のときは、同じデータを表で表示する（新しい順）。
 */
export default function ColumnChart({
  data,
  unit,
  showTable,
}: ColumnChartProps) {
  // 初期表示は最新（右端）を選択
  const [selected, setSelected] = useState(data.length - 1);

  if (showTable) {
    return (
      <View>
        {[...data].reverse().map((d) => (
          <View key={d.longLabel} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{d.longLabel}</Text>
            <Text style={styles.tableValue}>{`${d.value} ${unit}`}</Text>
          </View>
        ))}
      </View>
    );
  }

  // y 軸の最大値: 最大値を目盛り間隔の倍数に切り上げる（最低 4）
  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const domainMax = Math.max(4, Math.ceil(maxValue / TICK_STEP) * TICK_STEP);
  const ticks = Array.from(
    { length: domainMax / TICK_STEP + 1 },
    (_, i) => i * TICK_STEP,
  );
  /** 値 → 下端からの高さ（px） */
  const y = (v: number) => (v / domainMax) * PLOT_HEIGHT;

  return (
    <View style={styles.chart}>
      {/* y 軸の目盛りラベル（文字の高さの半分ずらして目盛り線と中心を揃える） */}
      <View style={styles.yAxis}>
        {ticks.map((t) => (
          <Text key={t} style={[styles.tickLabel, { bottom: y(t) - 7 }]}>
            {t}
          </Text>
        ))}
      </View>
      <View style={styles.plotArea}>
        <View style={styles.plot}>
          {ticks.map((t) => (
            <View key={t} style={[styles.gridline, { bottom: y(t) }]} />
          ))}
          {/* 各棒の列全体をタップ領域にして、細い棒でも押しやすくする */}
          <View style={styles.columns}>
            {data.map((d, i) => {
              const isSelected = i === selected;
              return (
                <Pressable
                  key={d.longLabel}
                  style={styles.slot}
                  onPress={() => setSelected(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.longLabel} ${d.value}${unit}`}
                >
                  {isSelected && (
                    <Text style={styles.valueLabel}>{`${d.value}${unit}`}</Text>
                  )}
                  {d.value > 0 && (
                    <View style={[styles.column, { height: y(d.value) }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.xAxis}>
          {data.map((d, i) => (
            <Text
              key={d.longLabel}
              style={[styles.xLabel, i === selected && styles.xLabelSelected]}
            >
              {d.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    gap: 8,
  },
  yAxis: {
    width: 16,
    height: PLOT_HEIGHT,
    // 最上段の目盛りラベルと選択中の値ラベルが入る余白
    marginTop: 20,
  },
  tickLabel: {
    position: 'absolute',
    right: 0,
    fontSize: 11,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  plotArea: {
    flex: 1,
  },
  plot: {
    height: PLOT_HEIGHT,
    marginTop: 20,
  },
  gridline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.border,
  },
  columns: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // 値ラベルが上にはみ出せるよう、上方向にもタップ領域を広げる
    top: -20,
    flexDirection: 'row',
  },
  slot: {
    flex: 1,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  column: {
    width: COLUMN_WIDTH,
    backgroundColor: Palette.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 6,
  },
  xLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  xLabelSelected: {
    fontWeight: '700',
    color: Palette.text,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  tableLabel: {
    fontSize: 13,
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
});
