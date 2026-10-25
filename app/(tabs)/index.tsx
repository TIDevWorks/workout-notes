import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddWorkoutButton from '@/components/AddWorkoutButton';
import Calendar from '@/components/Calendar';
import WorkoutList from '@/components/WorkoutListForTheDay';
import { Palette } from '@/constants/Colors';
import { formatDayLabel, monthRange, toDateString } from '@/helper/format';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';

/**
 * Calendar タブ。カレンダーで日付を選び、その日の記録を一覧表示する。
 * Add Workout から選択中の日付に記録を追加できる。
 */
export default function Index() {
  const userId = useUserId();
  // 「今日」は画面を開いた時点の日付で固定する
  const today = useMemo(() => toDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  // カレンダーで表示中の月（month は 1〜12）。ドットを付ける記録の取得範囲に使う
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // カレンダーのドット用（表示中の月）と、選択日のリスト用
  const { start, end } = monthRange(visibleMonth.year, visibleMonth.month);
  const monthLogs = useWorkoutLogs(userId, start, end);
  const dayLogs = useWorkoutLogs(userId, selectedDate, selectedDate);
  const workouts = dayLogs.logs;
  // 記録の種目名を、種目の今の名前で表示するために使う
  const { nameById } = useTrainings(userId);
  // 記録がある日付（重複なし）。カレンダーのドット表示に使う
  const markedDateStrings = useMemo(
    () => [...new Set(monthLogs.logs.map((log) => log.date))],
    [monthLogs.logs],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        {/* TODO: 押したときの動作は未定 */}
        <Pressable style={styles.infoButton}>
          <FontAwesome name="info-circle" size={16} color={Palette.textMuted} />
        </Pressable>
      </View>
      <Calendar
        today={today}
        selectedDate={selectedDate}
        markedDateStrings={markedDateStrings}
        onSelectDate={setSelectedDate}
        onMonthChange={(year, month) => setVisibleMonth({ year, month })}
      />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {formatDayLabel(selectedDate, today)}
        </Text>
        {workouts.length > 0 && (
          <Text style={styles.count}>{`${workouts.length} 種目`}</Text>
        )}
      </View>
      <WorkoutList
        workouts={workouts}
        nameById={nameById}
        loading={dayLogs.loading}
        error={dayLogs.error}
      />
      <AddWorkoutButton date={selectedDate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.text,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 22,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  count: {
    fontSize: 12,
    color: Palette.textMuted,
  },
});
