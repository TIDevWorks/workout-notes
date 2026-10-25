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
  // 「今日」ボタンでカレンダーを作り直して今月に戻すためのキー
  const [calendarKey, setCalendarKey] = useState(0);

  // 今日を選択していて、今月を表示している（＝戻る必要がない）か
  const isShowingToday = useMemo(() => {
    const now = new Date();
    return (
      selectedDate === today &&
      visibleMonth.year === now.getFullYear() &&
      visibleMonth.month === now.getMonth() + 1
    );
  }, [selectedDate, today, visibleMonth]);

  const goToToday = () => {
    setSelectedDate(today);
    // カレンダーは initialDate が変わったときしか月を切り替えないため、作り直して今月を表示する
    setCalendarKey((k) => k + 1);
  };

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
        {/* 今日以外を見ているときだけ押せる */}
        <Pressable
          onPress={goToToday}
          disabled={isShowingToday}
          style={({ pressed }) => [
            styles.todayButton,
            pressed && styles.todayButtonPressed,
          ]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="今日に戻る"
          accessibilityState={{ disabled: isShowingToday }}
        >
          <FontAwesome
            name="calendar-check-o"
            size={14}
            color={isShowingToday ? Palette.textDisabled : Palette.primary}
          />
          <Text
            style={[
              styles.todayText,
              isShowingToday && styles.todayTextDisabled,
            ]}
          >
            今日
          </Text>
        </Pressable>
      </View>
      <Calendar
        key={calendarKey}
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
  todayButton: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.surface,
    shadowColor: Palette.text,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  todayButtonPressed: {
    backgroundColor: Palette.surfaceMuted,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primary,
  },
  todayTextDisabled: {
    color: Palette.textDisabled,
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
