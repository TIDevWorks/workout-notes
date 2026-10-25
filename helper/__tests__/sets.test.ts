import {
  defaultSetEntries,
  formatSetsDetail,
  isUniform,
  toSetEntries,
} from '@/helper/sets';

describe('toSetEntries', () => {
  test('新しい形式（setEntries）はそのまま使う', () => {
    expect(
      toSetEntries({
        setEntries: [
          { weight: 10, reps: 3 },
          { weight: 8, reps: 2 },
        ],
      }),
    ).toEqual([
      { weight: 10, reps: 3 },
      { weight: 8, reps: 2 },
    ]);
  });

  test('古い形式（weight / reps / sets）は同じセットが sets 個として扱う', () => {
    expect(toSetEntries({ weight: 60, reps: 10, sets: 3 })).toEqual([
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ]);
  });

  test('古い形式の自重（weight: 0）', () => {
    expect(toSetEntries({ weight: 0, reps: 15, sets: 2 })).toEqual([
      { weight: 0, reps: 15 },
      { weight: 0, reps: 15 },
    ]);
  });

  test('両方の形式がある場合は新しい形式を優先する（編集途中のデータなど）', () => {
    expect(
      toSetEntries({
        setEntries: [{ weight: 20, reps: 5 }],
        weight: 60,
        reps: 10,
        sets: 3,
      }),
    ).toEqual([{ weight: 20, reps: 5 }]);
  });

  test('値が欠けている・壊れているデータでも落ちない', () => {
    expect(toSetEntries({})).toEqual([]);
    expect(toSetEntries({ setEntries: [{ weight: 'x' }, null] })).toEqual([
      { weight: 0, reps: 0 },
      { weight: 0, reps: 0 },
    ]);
  });
});

describe('defaultSetEntries', () => {
  test('種目のデフォルト値から初期値を作る', () => {
    expect(
      defaultSetEntries({ defaultWeight: 40, defaultReps: 10, defaultSets: 3 }),
    ).toEqual([
      { weight: 40, reps: 10 },
      { weight: 40, reps: 10 },
      { weight: 40, reps: 10 },
    ]);
  });

  test('作った各セットは別々のオブジェクト（1つを変えても他が変わらない）', () => {
    const sets = defaultSetEntries({
      defaultWeight: 40,
      defaultReps: 10,
      defaultSets: 2,
    });
    expect(sets[0]).not.toBe(sets[1]);
  });
});

describe('isUniform', () => {
  test('すべて同じなら true', () => {
    expect(
      isUniform([
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
      ]),
    ).toBe(true);
    expect(isUniform([{ weight: 60, reps: 10 }])).toBe(true);
  });

  test('重量か回数が1つでも違えば false', () => {
    expect(
      isUniform([
        { weight: 60, reps: 10 },
        { weight: 55, reps: 10 },
      ]),
    ).toBe(false);
    expect(
      isUniform([
        { weight: 60, reps: 10 },
        { weight: 60, reps: 8 },
      ]),
    ).toBe(false);
  });
});

describe('formatSetsDetail', () => {
  test('すべて同じセットはまとめて表示する', () => {
    expect(
      formatSetsDetail([
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
      ]),
    ).toBe('60 kg × 10 reps × 3 sets');
  });

  test('セットごとに違う場合は1セットずつ並べる', () => {
    expect(
      formatSetsDetail([
        { weight: 10, reps: 3 },
        { weight: 8, reps: 2 },
      ]),
    ).toBe('10 kg × 3 / 8 kg × 2');
  });

  test('重量 0 は「自重」', () => {
    expect(formatSetsDetail([{ weight: 0, reps: 15 }])).toBe(
      '自重 × 15 reps × 1 sets',
    );
    expect(
      formatSetsDetail([
        { weight: 0, reps: 15 },
        { weight: 0, reps: 12 },
      ]),
    ).toBe('自重 × 15 / 自重 × 12');
  });

  test('小数の重量', () => {
    expect(
      formatSetsDetail([
        { weight: 22.5, reps: 8 },
        { weight: 20, reps: 10 },
      ]),
    ).toBe('22.5 kg × 8 / 20 kg × 10');
  });

  test('セットがない場合は空文字', () => {
    expect(formatSetsDetail([])).toBe('');
  });
});
