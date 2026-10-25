import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChartCard from '@/components/ChartCard';
import LineChart from '@/components/LineChart';
import SegmentedControl from '@/components/SegmentedControl';
import StatTile from '@/components/StatTile';
import { Palette } from '@/constants/Colors';
import { WorkoutLog } from '@/constants/training';
import {
  formatShortDate,
  monthRange,
  parseDateString,
  toDateString,
} from '@/helper/format';
import {
  Metric,
  buildSeries,
  metricLabels,
  weightedTrainingIds,
} from '@/helper/stats';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';

/** グラフの対象期間（月数） */
const RANGE_MONTHS = 6;

const metricOptions = (['maxWeight', 'oneRm'] as Metric[]).map((value) => ({
  value,
  label: metricLabels[value],
}));

/** トレーニングした日数（同じ日に複数記録があっても1日と数える） */
const countDays = (logs: WorkoutLog[]) =>
  new Set(logs.map((log) => log.date)).size;

/**
 * Chart タブ。選んだ種目の Max重量 または 推定1RM の推移を折れ線グラフで表示する。
 * 直近 RANGE_MONTHS ヶ月の記録を1回の購読でまとめて取得し、画面側で集計する。
 */
export default function ChartPage() {
  const userId = useUserId();
  const today = useMemo(() => toDateString(new Date()), []);
  const [metric, setMetric] = useState<Metric>('maxWeight');
  // 未選択（null）の間は、記録の多い種目を表示する
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // 取得範囲（直近 RANGE_MONTHS ヶ月の1日から今日まで）と、今月・先月の範囲
  const periods = useMemo(() => {
    const now = parseDateString(today);
    const thisMonth = monthRange(now.getFullYear(), now.getMonth() + 1);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = monthRange(
      lastMonthDate.getFullYear(),
      lastMonthDate.getMonth() + 1,
    );
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - (RANGE_MONTHS - 1),
      1,
    );
    return { thisMonth, lastMonth, rangeStart: toDateString(start) };
  }, [today]);

  const { logs, loading } = useWorkoutLogs(userId, periods.rangeStart, today);
  const { nameById } = useTrainings(userId);

  // 今月のトレーニング日数（先月との差つき）
  const days = useMemo(() => {
    const inMonth = (start: string, end: string) =>
      logs.filter((l) => l.date >= start && l.date <= end);
    const thisDays = countDays(inMonth(periods.thisMonth.start, today));
    const lastDays = countDays(
      inMonth(periods.lastMonth.start, periods.lastMonth.end),
    );
    return { value: thisDays, delta: thisDays - lastDays };
  }, [logs, periods, today]);

  // グラフで選べる種目（重量を記録した種目、記録の多い順）
  const trainingIds = useMemo(() => weightedTrainingIds(logs), [logs]);
  const trainingId =
    pickedId && trainingIds.includes(pickedId) ? pickedId : trainingIds[0];
  const trainingLabel = (id: string) => nameById.get(id) ?? id;

  const series = useMemo(
    () => (trainingId ? buildSeries(logs, trainingId, metric) : []),
    [logs, trainingId, metric],
  );
  const best = series.reduce<(typeof series)[number] | null>(
    (acc, p) => (!acc || p.value > acc.value ? p : acc),
    null,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} color={Palette.textMuted} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* 表示の切り替え（下のカードとグラフの両方に反映される） */}
          {trainingId && (
            <View style={styles.filters}>
              <SegmentedControl
                options={metricOptions}
                value={metric}
                onChange={setMetric}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {trainingIds.map((id) => {
                  const isActive = id === trainingId;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setPickedId(id)}
                      style={[styles.chip, isActive && styles.chipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {trainingLabel(id)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.tiles}>
            <StatTile
              label="今月のトレーニング日数"
              value={days.value}
              unit="日"
              delta={{ value: days.delta, period: '先月比' }}
            />
            <StatTile
              label={
                trainingId
                  ? `${trainingLabel(trainingId)}の${metricLabels[metric]}`
                  : metricLabels[metric]
              }
              value={best?.value ?? null}
              unit="kg"
              caption={
                best
                  ? `${formatShortDate(best.date)}・直近${RANGE_MONTHS}ヶ月の最高`
                  : '記録なし'
              }
            />
          </View>

          {trainingId ? (
            <ChartCard
              title={`${trainingLabel(trainingId)}の${metricLabels[metric]}`}
              subtitle={`直近${RANGE_MONTHS}ヶ月・グラフをタップで値を表示`}
              accessory={
                <Pressable onPress={() => setShowTable((v) => !v)} hitSlop={8}>
                  {({ pressed }) => (
                    <Text
                      style={[styles.toggle, pressed && styles.togglePressed]}
                    >
                      {showTable ? 'グラフで見る' : '表で見る'}
                    </Text>
                  )}
                </Pressable>
              }
            >
              <LineChart
                // 種目・指標を変えたら、選択中の点を最新に戻す
                key={`${trainingId}-${metric}`}
                data={series}
                unit="kg"
                showTable={showTable}
              />
              {metric === 'oneRm' && (
                <Text style={styles.note}>
                  推定1RM = 重量 × (1 + 回数 ÷
                  30)（Epley式）。各セットから計算した、その日の最大値です。回数が多いセットほど誤差が大きくなります。
                </Text>
              )}
            </ChartCard>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {`直近${RANGE_MONTHS}ヶ月に重量を記録した種目がありません。\n記録するとここに推移が表示されます。`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Palette.text,
  },
  loading: {
    marginTop: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  filters: {
    gap: 10,
  },
  chips: {
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.text,
  },
  chipTextActive: {
    fontWeight: '700',
    color: Palette.white,
  },
  tiles: {
    flexDirection: 'row',
    gap: 12,
  },
  toggle: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.primary,
  },
  togglePressed: {
    color: Palette.primaryPressed,
  },
  note: {
    fontSize: 11,
    lineHeight: 16,
    color: Palette.textMuted,
  },
  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.dashed,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.textMuted,
    textAlign: 'center',
  },
});
