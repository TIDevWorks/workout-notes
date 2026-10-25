import { useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Palette } from '@/constants/Colors';
import { formatShortDate, parseDateString } from '@/helper/format';
import { SeriesPoint, niceTicks } from '@/helper/stats';

type LineChartProps = {
  /** 日付の古い順 */
  data: SeriesPoint[];
  unit: string;
  /** 表で表示する */
  showTable: boolean;
};

/** 折れ線を描く領域の高さ（x 軸ラベルを除く） */
const PLOT_HEIGHT = 160;
/** 選択中の値ラベルを入れる上の余白 */
const TOP_PADDING = 24;
/** y 軸の目盛りラベルの幅 */
const Y_AXIS_WIDTH = 36;
/** 左右の端の点が欠けないための余白 */
const SIDE_PADDING = 8;

const toTime = (date: string) => parseDateString(date).getTime();

/**
 * 折れ線グラフ（1系列）。x 軸は日付の間隔どおり、y 軸はデータの範囲に合わせる。
 * グラフをタップすると、いちばん近い点の値と日付を表示する（初期は最新の点）。
 * showTable が true のときは、同じデータを表で表示する（新しい順）。
 */
export default function LineChart({ data, unit, showTable }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(data.length - 1);

  if (showTable) {
    return (
      <View>
        {[...data].reverse().map((d) => (
          <View key={d.date} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{d.date.replace(/-/g, '/')}</Text>
            <Text style={styles.tableValue}>{`${d.value} ${unit}`}</Text>
          </View>
        ))}
      </View>
    );
  }

  const ticks = niceTicks(
    Math.min(...data.map((d) => d.value)),
    Math.max(...data.map((d) => d.value)),
  );
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const plotWidth = Math.max(width - Y_AXIS_WIDTH, 0);
  const innerWidth = Math.max(plotWidth - SIDE_PADDING * 2, 0);

  const firstTime = toTime(data[0].date);
  const timeSpan = toTime(data[data.length - 1].date) - firstTime;
  /** 日付 → x 座標（1点だけなら中央） */
  const x = (date: string) =>
    SIDE_PADDING +
    (timeSpan === 0
      ? innerWidth / 2
      : ((toTime(date) - firstTime) / timeSpan) * innerWidth);
  /** 値 → y 座標（上が大きい値） */
  const y = (value: number) =>
    TOP_PADDING + (1 - (value - yMin) / (yMax - yMin)) * PLOT_HEIGHT;

  const points = data.map((d) => ({ ...d, cx: x(d.date), cy: y(d.value) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`)
    .join(' ');
  const baseline = TOP_PADDING + PLOT_HEIGHT;
  // 線の下を薄く塗る（値の変化を読み取りやすくする）
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].cx},${baseline} L${points[0].cx},${baseline} Z`
      : '';

  /** タップした位置にいちばん近い点を選ぶ（細かい点を正確に押さなくてよい） */
  const selectNearest = (e: GestureResponderEvent) => {
    const tapX = e.nativeEvent.locationX;
    let nearest = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.cx - tapX) < Math.abs(points[nearest].cx - tapX)) {
        nearest = i;
      }
    });
    setSelected(nearest);
  };

  const current = points[Math.min(selected, points.length - 1)];
  // x 軸のラベルは最初・中央・最後の点だけにして、重ならないようにする
  const last = points.length - 1;
  const xLabelIndexes = [...new Set([0, Math.floor(last / 2), last])];

  return (
    <View>
      <View
        style={styles.chart}
        onLayout={(e: LayoutChangeEvent) =>
          setWidth(e.nativeEvent.layout.width)
        }
      >
        {/* y 軸の目盛りラベル（文字の高さの半分ずらして目盛り線と中心を揃える） */}
        <View style={styles.yAxis}>
          {ticks.map((t) => (
            <Text key={t} style={[styles.tickLabel, { top: y(t) - 7 }]}>
              {t}
            </Text>
          ))}
        </View>

        {width > 0 && (
          <Pressable
            style={{ width: plotWidth, height: baseline }}
            onPress={selectNearest}
            accessibilityRole="adjustable"
            accessibilityLabel={`${formatShortDate(current.date)} ${current.value}${unit}`}
          >
            <Svg width={plotWidth} height={baseline}>
              {ticks.map((t) => (
                <Line
                  key={t}
                  x1={0}
                  x2={plotWidth}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={Palette.border}
                  strokeWidth={1}
                />
              ))}
              {areaPath !== '' && (
                <Path d={areaPath} fill={Palette.primary} fillOpacity={0.1} />
              )}
              <Path
                d={linePath}
                stroke={Palette.primary}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              {points.map((p, i) => (
                <Circle
                  key={p.date}
                  cx={p.cx}
                  cy={p.cy}
                  // 選択中の点は大きくする。白い縁で線と重なっても見分けられるようにする
                  r={i === selected ? 6 : 4}
                  fill={Palette.primary}
                  stroke={Palette.surface}
                  strokeWidth={2}
                />
              ))}
            </Svg>
            {/* 選択中の点の値（点の真上） */}
            <View
              pointerEvents="none"
              style={[
                styles.valueLabel,
                {
                  left: Math.min(Math.max(current.cx - 50, 0), plotWidth - 100),
                  top: current.cy - 24,
                },
              ]}
            >
              <Text style={styles.valueText}>{`${current.value} ${unit}`}</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* x 軸の日付ラベル */}
      <View style={[styles.xAxis, { marginLeft: Y_AXIS_WIDTH }]}>
        {width > 0 &&
          xLabelIndexes.map((i) => (
            <Text
              key={points[i].date}
              style={[
                styles.xLabel,
                {
                  left: Math.min(
                    Math.max(points[i].cx - 20, 0),
                    plotWidth - 40,
                  ),
                },
                i === selected && styles.xLabelSelected,
              ]}
            >
              {formatShortDate(points[i].date)}
            </Text>
          ))}
      </View>

      <Text style={styles.selectedInfo}>
        {`${current.date.replace(/-/g, '/')} ・ ${current.value} ${unit}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
  },
  yAxis: {
    width: Y_AXIS_WIDTH,
    height: TOP_PADDING + PLOT_HEIGHT,
  },
  tickLabel: {
    position: 'absolute',
    right: 8,
    fontSize: 11,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  valueLabel: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  xAxis: {
    height: 18,
    marginTop: 6,
  },
  xLabel: {
    position: 'absolute',
    width: 40,
    textAlign: 'center',
    fontSize: 10,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  xLabelSelected: {
    fontWeight: '700',
    color: Palette.text,
  },
  selectedInfo: {
    marginTop: 8,
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
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
