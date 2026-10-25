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
import BarChart, { BarDatum } from '@/components/BarChart';
import ChartCard from '@/components/ChartCard';
import ColumnChart, { ColumnDatum } from '@/components/ColumnChart';
import StatTile from '@/components/StatTile';
import { Palette } from '@/constants/Colors';
import { WorkoutLog } from '@/constants/training';
import { auth } from '@/firebaseConfig';
import {
  addDays,
  formatShortDate,
  monthRange,
  parseDateString,
  startOfWeek,
  toDateString,
} from '@/helper/format';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';

const WEEKS = 8;
/** 種目別グラフに個別で表示する最大数（残りは「その他」にまとめる） */
const MAX_TRAININGS = 7;

const countDays = (logs: WorkoutLog[]) =>
  new Set(logs.map((log) => log.date)).size;

const inRange = (log: WorkoutLog, start: string, end: string) =>
  log.date >= start && log.date <= end;

export default function ChartPage() {
  const userId = auth.currentUser?.uid;
  const today = useMemo(() => toDateString(new Date()), []);
  const [showTable, setShowTable] = useState(false);

  const periods = useMemo(() => {
    const now = parseDateString(today);
    const thisMonth = monthRange(now.getFullYear(), now.getMonth() + 1);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = monthRange(
      lastMonthDate.getFullYear(),
      lastMonthDate.getMonth() + 1,
    );
    const firstWeekStart = addDays(startOfWeek(today), -7 * (WEEKS - 1));
    const rangeStart =
      firstWeekStart < lastMonth.start ? firstWeekStart : lastMonth.start;
    return { thisMonth, lastMonth, firstWeekStart, rangeStart };
  }, [today]);

  const { logs, loading } = useWorkoutLogs(userId, periods.rangeStart, today);

  const stats = useMemo(() => {
    const { thisMonth, lastMonth } = periods;
    const thisLogs = logs.filter((l) => inRange(l, thisMonth.start, today));
    const lastLogs = logs.filter((l) =>
      inRange(l, lastMonth.start, lastMonth.end),
    );
    return {
      days: countDays(thisLogs),
      daysDelta: countDays(thisLogs) - countDays(lastLogs),
      records: thisLogs.length,
      recordsDelta: thisLogs.length - lastLogs.length,
    };
  }, [logs, periods, today]);

  const weekly = useMemo<ColumnDatum[]>(
    () =>
      Array.from({ length: WEEKS }, (_, i) => {
        const start = addDays(periods.firstWeekStart, 7 * i);
        const end = addDays(start, 6);
        return {
          label: formatShortDate(start),
          longLabel: `${formatShortDate(start)}〜${formatShortDate(end)}`,
          value: countDays(logs.filter((l) => inRange(l, start, end))),
        };
      }),
    [logs, periods],
  );

  const byTraining = useMemo<BarDatum[]>(() => {
    const counts = new Map<string, number>();
    logs
      .filter((l) => inRange(l, periods.firstWeekStart, today))
      .forEach((l) =>
        counts.set(l.trainingId, (counts.get(l.trainingId) ?? 0) + 1),
      );
    const sorted = [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    if (sorted.length <= MAX_TRAININGS) return sorted;
    const rest = sorted.slice(MAX_TRAININGS - 1);
    return [
      ...sorted.slice(0, MAX_TRAININGS - 1),
      { label: 'その他', value: rest.reduce((sum, d) => sum + d.value, 0) },
    ];
  }, [logs, periods, today]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chart</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} color={Palette.textMuted} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.tiles}>
            <StatTile
              label="今月のトレーニング日数"
              value={stats.days}
              unit="日"
              delta={{ value: stats.daysDelta, period: '先月比' }}
            />
            <StatTile
              label="今月の記録"
              value={stats.records}
              unit="種目"
              delta={{ value: stats.recordsDelta, period: '先月比' }}
            />
          </View>

          <ChartCard
            title="週ごとのトレーニング日数"
            subtitle={`直近${WEEKS}週間・日曜始まり・棒をタップで値を表示`}
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
            <ColumnChart data={weekly} unit="日" showTable={showTable} />
          </ChartCard>

          <ChartCard title="種目別の記録回数" subtitle={`直近${WEEKS}週間`}>
            {byTraining.length > 0 ? (
              <BarChart data={byTraining} unit="回" />
            ) : (
              <Text style={styles.empty}>
                {`直近${WEEKS}週間の記録はありません`}
              </Text>
            )}
          </ChartCard>
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
  empty: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
