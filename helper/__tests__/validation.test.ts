import {
  REPS_MAX,
  SETS_MAX,
  WEIGHT_MAX,
  parseNumberInput,
  parseWeightInput,
  validateSetInputs,
  validateWorkoutValues,
} from '@/helper/validation';

describe('validateSetInputs（記録のセットごとの入力）', () => {
  test('正しい入力は null', () => {
    expect(
      validateSetInputs([
        { weight: '10', reps: '3' },
        { weight: '8', reps: '2' },
      ]),
    ).toBeNull();
    // 自重（空欄・0）や全角も受け付ける
    expect(
      validateSetInputs([
        { weight: '', reps: '15' },
        { weight: '０', reps: '１２' },
      ]),
    ).toBeNull();
  });

  test('何セット目が間違っているかをメッセージに含める', () => {
    expect(
      validateSetInputs([
        { weight: '10', reps: '3' },
        { weight: '-1', reps: '2' },
      ]),
    ).toMatch(/^2セット目: 重量/);
    expect(
      validateSetInputs([
        { weight: '10', reps: '3' },
        { weight: '8', reps: '2' },
        { weight: '8', reps: '0' },
      ]),
    ).toMatch(/^3セット目: 回数/);
  });

  test('同じセットに重量と回数の両方の誤りがあれば、重量を先に返す', () => {
    expect(validateSetInputs([{ weight: 'abc', reps: '' }])).toMatch(
      /^1セット目: 重量/,
    );
  });

  test('セットが0個・多すぎる場合', () => {
    expect(validateSetInputs([])).toMatch(/1つ以上/);
    const tooMany = Array.from({ length: SETS_MAX + 1 }, () => ({
      weight: '10',
      reps: '1',
    }));
    expect(validateSetInputs(tooMany)).toMatch(/セット数/);
    expect(validateSetInputs(tooMany.slice(0, SETS_MAX))).toBeNull();
  });
});

describe('parseNumberInput', () => {
  test('半角の整数・小数', () => {
    expect(parseNumberInput('12')).toBe(12);
    expect(parseNumberInput('2.5')).toBe(2.5);
  });

  test('前後の空白を無視する', () => {
    expect(parseNumberInput('  7 ')).toBe(7);
  });

  test('全角の数字・小数点を受け付ける', () => {
    expect(parseNumberInput('１０')).toBe(10);
    expect(parseNumberInput('２．５')).toBe(2.5);
  });

  test('空欄や数値でない入力は NaN', () => {
    expect(parseNumberInput('')).toBeNaN();
    expect(parseNumberInput('   ')).toBeNaN();
    expect(parseNumberInput('abc')).toBeNaN();
    // カンマ区切りの小数は受け付けない
    expect(parseNumberInput('1,5')).toBeNaN();
  });
});

describe('parseWeightInput', () => {
  test('空欄は 0（自重）', () => {
    expect(parseWeightInput('')).toBe(0);
    expect(parseWeightInput('  ')).toBe(0);
  });

  test('数値はそのまま', () => {
    expect(parseWeightInput('40')).toBe(40);
    expect(parseWeightInput('２．５')).toBe(2.5);
  });
});

describe('validateWorkoutValues', () => {
  test('正しい入力は null', () => {
    expect(validateWorkoutValues('40', '10', '3')).toBeNull();
    expect(validateWorkoutValues('2.5', '12', '3')).toBeNull();
    expect(validateWorkoutValues('１０', '１０', '３')).toBeNull();
  });

  test('重量は空欄・0（自重）でもよい', () => {
    expect(validateWorkoutValues('', '15', '3')).toBeNull();
    expect(validateWorkoutValues('0', '15', '3')).toBeNull();
  });

  test('境界値（最小・最大）は通る', () => {
    expect(
      validateWorkoutValues(String(WEIGHT_MAX), '1', String(SETS_MAX)),
    ).toBeNull();
    expect(validateWorkoutValues('0', String(REPS_MAX), '1')).toBeNull();
  });

  test('重量が範囲外・数値でない', () => {
    expect(validateWorkoutValues('-1', '10', '3')).toMatch(/重量/);
    expect(validateWorkoutValues(String(WEIGHT_MAX + 1), '10', '3')).toMatch(
      /重量/,
    );
    expect(validateWorkoutValues('abc', '10', '3')).toMatch(/重量/);
  });

  test('回数は 1 以上の整数', () => {
    expect(validateWorkoutValues('40', '0', '3')).toMatch(/回数/);
    expect(validateWorkoutValues('40', '1.5', '3')).toMatch(/回数/);
    expect(validateWorkoutValues('40', '', '3')).toMatch(/回数/);
    expect(validateWorkoutValues('40', String(REPS_MAX + 1), '3')).toMatch(
      /回数/,
    );
  });

  test('セット数は 1 以上の整数', () => {
    expect(validateWorkoutValues('40', '10', '0')).toMatch(/セット数/);
    expect(validateWorkoutValues('40', '10', '2.5')).toMatch(/セット数/);
    expect(validateWorkoutValues('40', '10', String(SETS_MAX + 1))).toMatch(
      /セット数/,
    );
  });

  test('複数の誤りがある場合は、重量 → 回数 → セット数の順に最初の1つを返す', () => {
    expect(validateWorkoutValues('-1', '0', '0')).toMatch(/重量/);
    expect(validateWorkoutValues('40', '0', '0')).toMatch(/回数/);
  });
});
