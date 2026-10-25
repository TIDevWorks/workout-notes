// helper/validation.ts
// 重量・回数・セット数の入力値の変換と検証（種目の初期値と記録の値で共通）

export const WEIGHT_MAX = 1000;
export const REPS_MAX = 1000;
export const SETS_MAX = 100;

/** 入力値を数値に変換する（全角数字も受け付ける）。空や数値でなければ NaN */
export const parseNumberInput = (text: string) =>
  text.trim() === ''
    ? NaN
    : Number(
        text
          .trim()
          .replace(/[０-９．]/g, (c) =>
            String.fromCharCode(c.charCodeAt(0) - 0xfee0),
          ),
      );

/** 重量の入力値を数値にする。空欄は 0（自重）として扱う */
export const parseWeightInput = (text: string) =>
  text.trim() === '' ? 0 : parseNumberInput(text);

/** 1セット分の重量の検証。問題なければ null */
const validateWeight = (weight: string) => {
  const w = parseWeightInput(weight);
  return Number.isFinite(w) && w >= 0 && w <= WEIGHT_MAX
    ? null
    : `重量は 0〜${WEIGHT_MAX} kg の数値で入力してください。`;
};

/** 1セット分の回数の検証。問題なければ null */
const validateReps = (reps: string) => {
  const r = parseNumberInput(reps);
  return Number.isInteger(r) && r >= 1 && r <= REPS_MAX
    ? null
    : `回数は 1〜${REPS_MAX} の整数で入力してください。`;
};

/**
 * セットごとの重量・回数の入力を検証する（記録の追加・編集）。
 * 問題なければ null、あれば何セット目かを含むエラーメッセージ。
 */
export const validateSetInputs = (
  rows: { weight: string; reps: string }[],
): string | null => {
  if (rows.length < 1) return 'セットを1つ以上入力してください。';
  if (rows.length > SETS_MAX) {
    return `セット数は ${SETS_MAX} 以下にしてください。`;
  }
  for (const [i, row] of rows.entries()) {
    const error = validateWeight(row.weight) ?? validateReps(row.reps);
    if (error) return `${i + 1}セット目: ${error}`;
  }
  return null;
};

/**
 * 重量・回数・セット数の入力を検証する（種目のデフォルト値）。
 * 問題なければ null、あればエラーメッセージ。
 */
export const validateWorkoutValues = (
  weight: string,
  reps: string,
  sets: string,
): string | null => {
  const error = validateWeight(weight) ?? validateReps(reps);
  if (error) return error;
  const s = parseNumberInput(sets);
  if (!Number.isInteger(s) || s < 1 || s > SETS_MAX) {
    return `セット数は 1〜${SETS_MAX} の整数で入力してください。`;
  }
  return null;
};
