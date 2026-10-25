import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { Palette, Shadow } from '@/constants/Colors';
import { WEEKDAYS, parseDateString, toDateString } from '@/helper/format';

// react-native-calendars の Calendar をベースに、ヘッダー（月表示と月送り）と
// 日付セルをデザインに合わせた独自コンポーネントに差し替えている。

/** 何ヶ月前までさかのぼれるか */
const PAST_MONTH_RANGE = 24;

type CalendarProps = {
  /** 今日（YYYY-MM-DD）。これより後の日付は選べない */
  today: string;
  /** 選択中の日付（YYYY-MM-DD） */
  selectedDate: string;
  /** 記録がある日付（YYYY-MM-DD）。日付の下にドットを表示する */
  markedDateStrings: string[];
  onSelectDate: (dateString: string) => void;
  /** 表示中の月が変わったとき（month は 1〜12） */
  onMonthChange: (year: number, month: number) => void;
};

/** customHeader に渡される props（ライブラリが表示中の月と月送り関数を渡す） */
type HeaderProps = {
  month?: { getFullYear: () => number; getMonth: () => number };
  addMonth?: (count: number) => void;
};

/** dayComponent に渡される props（marking は markedDates で指定した値） */
type DayProps = {
  date?: DateData;
  marking?: { selected?: boolean; marked?: boolean };
  onPress?: (date?: DateData) => void;
};

/** 日曜は赤、土曜は青、それ以外は fallback の色 */
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

/**
 * 月表示・月送りボタン・曜日の行からなるヘッダーを作る。
 * today を閉じ込めるため関数で生成している（Calendar 内の useMemo で1回だけ作る）。
 */
function createHeader(today: string) {
  const todayDate = parseDateString(today);
  // 「年 × 12 + 月」の通し番号で月を比較する
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
          {/* 過去は PAST_MONTH_RANGE ヶ月前まで、未来は今月までに制限 */}
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

/**
 * 日付セルを作る。選択日・今日・未来日・記録ありの状態に応じて見た目を変える。
 * ライブラリの state（'selected' など）は使わず、日付と marking から自前で判定する。
 */
function createDay(today: string) {
  return function Day({ date, marking, onPress }: DayProps) {
    if (!date) return <View style={styles.dayCell} />;

    // YYYY-MM-DD 形式なので文字列のまま大小比較できる

    const isFuture = date.dateString > today;
    const isToday = date.dateString === today;
    const isSelected = !!marking?.selected;
    const weekday = parseDateString(date.dateString).getDay();

    // 文字色の優先順位: 選択日（白） > 未来日（グレー） > 曜日の色
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
        {/* 記録ありのドット。選択日は丸と重なるため表示しない */}
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
  // コンポーネントを毎回作り直すとセルが再マウントされるため、today が変わったときだけ作る
  const { Header, Day, minDate } = useMemo(() => {
    // さかのぼれる最初の月の1日
    const min = parseDateString(today);
    min.setMonth(min.getMonth() - PAST_MONTH_RANGE, 1);
    return {
      Header: createHeader(today),
      Day: createDay(today),
      minDate: toDateString(min),
    };
  }, [today]);

  // ライブラリに渡す日付ごとの状態。Day には marking として渡される
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
        // 初回表示時にも呼ばれる
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
