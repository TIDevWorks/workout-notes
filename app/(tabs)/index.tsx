import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddWorkoutButton from '@/components/AddWorkoutButton';
import Calendar from '@/components/Calendar';
import WorkoutList from '@/components/WorkoutListForTheDay';
import { Palette } from '@/constants/Colors';
import { formatDayLabel, monthRange, toDateString } from '@/helper/format';
import { useUserId } from '@/hooks/useUserId';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';

export default function Index() {
  const userId = useUserId();
  const today = useMemo(() => toDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // カレンダーのドット用（表示中の月）と、選択日のリスト用
  const { start, end } = monthRange(visibleMonth.year, visibleMonth.month);
  const monthLogs = useWorkoutLogs(userId, start, end);
  const dayLogs = useWorkoutLogs(userId, selectedDate, selectedDate);
  const workouts = dayLogs.logs;
  const markedDateStrings = useMemo(
    () => [...new Set(monthLogs.logs.map((log) => log.date))],
    [monthLogs.logs],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
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
