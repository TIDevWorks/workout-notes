import {
  addDays,
  formatDayLabel,
  formatShortDate,
  formatTrainingDetail,
  monthRange,
  parseDateString,
  startOfWeek,
  toDateString,
} from '@/helper/format';

// 曜日の確認用: 2026-10-25 は日曜日、2027-01-01 は金曜日

describe('toDateString / parseDateString', () => {
  test('Date を YYYY-MM-DD（ゼロ埋め）に変換する', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('YYYY-MM-DD をローカル時刻の Date に変換する', () => {
    const date = parseDateString('2026-10-25');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(25);
    expect(date.getHours()).toBe(0);
  });

  test('変換して戻すと元の文字列になる', () => {
    for (const s of ['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31']) {
      expect(toDateString(parseDateString(s))).toBe(s);
    }
  });
});

describe('addDays', () => {
  test('月・年をまたいで進む', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  test('負の値で前に戻る', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  test('うるう年の 2/29 を扱える', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01');
  });

  test('0 日なら同じ日付', () => {
    expect(addDays('2026-10-25', 0)).toBe('2026-10-25');
  });

  test('週単位でまとめて進む（Chart の週の計算で使う）', () => {
    expect(addDays('2026-10-25', -7 * 7)).toBe('2026-09-06');
  });
});

describe('startOfWeek（日曜始まり）', () => {
  test('日曜日はその日のまま', () => {
    expect(startOfWeek('2026-10-25')).toBe('2026-10-25');
  });

  test('土曜日はその週の日曜日', () => {
    expect(startOfWeek('2026-10-31')).toBe('2026-10-25');
  });

  test('月をまたぐ週', () => {
    expect(startOfWeek('2026-11-03')).toBe('2026-11-01');
    expect(startOfWeek('2026-10-01')).toBe('2026-09-27');
  });

  test('年をまたぐ週', () => {
    expect(startOfWeek('2027-01-01')).toBe('2026-12-27');
  });
});

describe('monthRange', () => {
  test('31日・30日の月', () => {
    expect(monthRange(2026, 1)).toEqual({
      start: '2026-01-01',
      end: '2026-01-31',
    });
    expect(monthRange(2026, 4)).toEqual({
      start: '2026-04-01',
      end: '2026-04-30',
    });
  });

  test('2月（平年は28日、うるう年は29日）', () => {
    expect(monthRange(2026, 2).end).toBe('2026-02-28');
    expect(monthRange(2028, 2).end).toBe('2028-02-29');
    // 100で割り切れる年は平年、400で割り切れる年はうるう年
    expect(monthRange(2100, 2).end).toBe('2100-02-28');
    expect(monthRange(2000, 2).end).toBe('2000-02-29');
  });

  test('12月', () => {
    expect(monthRange(2026, 12)).toEqual({
      start: '2026-12-01',
      end: '2026-12-31',
    });
  });
});

describe('formatShortDate', () => {
  test('月/日（ゼロ埋めなし）', () => {
    expect(formatShortDate('2026-01-05')).toBe('1/5');
    expect(formatShortDate('2026-10-25')).toBe('10/25');
  });
});

describe('formatDayLabel', () => {
  test('今日なら「・今日」を付ける', () => {
    expect(formatDayLabel('2026-10-25', '2026-10-25')).toBe(
      '10月25日（日）・今日',
    );
  });

  test('今日以外は日付と曜日だけ', () => {
    expect(formatDayLabel('2026-10-24', '2026-10-25')).toBe('10月24日（土）');
    expect(formatDayLabel('2027-01-01', '2026-10-25')).toBe('1月1日（金）');
  });
});

describe('formatTrainingDetail', () => {
  test('重量・回数・セット数を並べる', () => {
    expect(formatTrainingDetail(60, 10, 3)).toBe('60 kg × 10 reps × 3 sets');
  });

  test('小数の重量', () => {
    expect(formatTrainingDetail(2.5, 12, 3)).toBe('2.5 kg × 12 reps × 3 sets');
  });

  test('重量 0 は「自重」と表示する', () => {
    expect(formatTrainingDetail(0, 15, 3)).toBe('自重 × 15 reps × 3 sets');
  });
});
