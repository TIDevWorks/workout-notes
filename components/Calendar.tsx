import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { Palette, Shadow } from '@/constants/Colors';
import { WEEKDAYS, parseDateString, toDateString } from '@/helper/format';

const PAST_MONTH_RANGE = 24;

type CalendarProps = {
  today: string;
  selectedDate: string;
  markedDateStrings: string[];
  onSelectDate: (dateString: string) => void;
  /** 表示中の月が変わったとき（month は 1〜12） */
  onMonthChange: (year: number, month: number) => void;
};

type HeaderProps = {
  month?: { getFullYear: () => number; getMonth: () => number };
  addMonth?: (count: number) => void;
};

type DayProps = {
  date?: DateData;
  marking?: { selected?: boolean; marked?: boolean };
  onPress?: (date?: DateData) => void;
};

const weekdayColor = (weekday: number, fallback: string) => {
  if (weekday === 0) return Palette.sunday;
  if (weekday === 6) return Palette.saturday;
  return fallback;
};

function ArrowButton({
  direction,
  disabled,
  onPress,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.arrowButton}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
    >
      <FontAwesome
        name={direction === 'left' ? 'angle-left' : 'angle-right'}
        size={16}
        color={disabled ? Palette.arrowDisabled : Palette.textMuted}
      />
    </Pressable>
  );
}

function createHeader(today: string) {
  const todayDate = parseDateString(today);
  const currentIndex = todayDate.getFullYear() * 12 + todayDate.getMonth();

  return function CalendarHeader({ month, addMonth }: HeaderProps) {
    if (!month) return null;
    const year = month.getFullYear();
    const monthIndex = year * 12 + month.getMonth();

    return (
      <View>
        <View style={styles.headerRow}>
          <Text style={styles.monthLabel}>
            {`${year}年${month.getMonth() + 1}月`}
          </Text>
          <View style={styles.arrows}>
            <ArrowButton
              direction="left"
              disabled={monthIndex <= currentIndex - PAST_MONTH_RANGE}
              onPress={() => addMonth?.(-1)}
            />
            <ArrowButton
              direction="right"
              disabled={monthIndex >= currentIndex}
              onPress={() => addMonth?.(1)}
            />
          </View>
        </View>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((label, i) => (
            <Text
              key={label}
              style={[
                styles.weekdayLabel,
                { color: weekdayColor(i, Palette.textMuted) },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };
}

function createDay(today: string) {
  return function Day({ date, marking, onPress }: DayProps) {
    if (!date) return <View style={styles.dayCell} />;

    const isFuture = date.dateString > today;
    const isToday = date.dateString === today;
    const isSelected = !!marking?.selected;
    const weekday = parseDateString(date.dateString).getDay();

    let color: string = weekdayColor(weekday, Palette.text);
    if (isFuture) color = Palette.textDisabled;
    if (isSelected) color = Palette.white;

    return (
      <Pressable
        style={styles.dayCell}
        disabled={isFuture}
        onPress={() => onPress?.(date)}
      >
        <View
          style={[
            styles.dayCircle,
            isToday && !isSelected && styles.todayRing,
            isSelected && styles.selectedCircle,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color },
              (isToday || isSelected) && styles.dayTextBold,
            ]}
          >
            {date.day}
          </Text>
        </View>
        <View
          style={[
            styles.dot,
            marking?.marked && !isSelected && styles.dotVisible,
          ]}
        />
      </Pressable>
    );
  };
}

export default function Calendar({
  today,
  selectedDate,
  markedDateStrings,
  onSelectDate,
  onMonthChange,
}: CalendarProps) {
  const { Header, Day, minDate } = useMemo(() => {
    const min = parseDateString(today);
    min.setMonth(min.getMonth() - PAST_MONTH_RANGE, 1);
    return {
      Header: createHeader(today),
      Day: createDay(today),
      minDate: toDateString(min),
    };
  }, [today]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; selected?: boolean }> = {};
    markedDateStrings.forEach((d) => {
      marks[d] = { marked: true };
    });
    marks[selectedDate] = { ...marks[selectedDate], selected: true };
    return marks;
  }, [markedDateStrings, selectedDate]);

  return (
    <View style={styles.card}>
      <RNCalendar
        initialDate={today}
        minDate={minDate}
        maxDate={today}
        hideExtraDays
        customHeader={Header}
        dayComponent={Day}
        markedDates={markedDates}
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        onMonthChange={(month: DateData) =>
          onMonthChange(month.year, month.month)
        }
        style={styles.calendar}
        theme={{
          calendarBackground: Palette.surface,
          weekVerticalMargin: 1,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 12,
    ...Shadow.card,
  },
  calendar: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  arrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    paddingVertical: 4,
  },
  dayCell: {
    height: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
  },
  selectedCircle: {
    backgroundColor: Palette.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  dayTextBold: {
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotVisible: {
    backgroundColor: Palette.dot,
  },
});
