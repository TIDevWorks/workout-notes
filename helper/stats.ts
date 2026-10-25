// helper/stats.ts
// Chart 画面の集計（Max重量・推定1RM・グラフの目盛り）。Firebase に依存しない純粋な処理
import { SetEntry, WorkoutLog } from '@/constants/training';

/** グラフに表示する指標 */
export type Metric = 'maxWeight' | 'oneRm';

export const metricLabels: Record<Metric, string> = {
  maxWeight: 'Max重量',
  oneRm: '推定1RM',
};

/** グラフの1点（1日分） */
export type SeriesPoint = { date: string; value: number };

/**
 * 推定1RM（Epley 式: 重量 × (1 + 回数 ÷ 30)）。1回だけのセットは重量そのもの。
 * 回数が多いほど誤差が大きくなる点に注意。
 */
export const estimateOneRm = (weight: number, reps: number) => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

/** 1回分の記録（複数セット）の中での最大値 */
export const bestOfSets = (sets: SetEntry[], metric: Metric) =>
  Math.max(
    0,
    ...sets.map((s) =>
      metric === 'maxWeight' ? s.weight : estimateOneRm(s.weight, s.reps),
    ),
  );

/** 表示用に小数第1位で丸める（例: 93.33 → 93.3） */
export const roundValue = (value: number) => Math.round(value * 10) / 10;

/**
 * 種目の推移（日付ごとの最大値、古い順）。同じ日に複数の記録があれば最大値を使う。
 * 値が 0（自重のみ）の日は含めない。
 */
export const buildSeries = (
  logs: WorkoutLog[],
  trainingId: string,
  metric: Metric,
): SeriesPoint[] => {
  const byDate = new Map<string, number>();
  for (const log of logs) {
    if (log.trainingId !== trainingId) continue;
    const value = bestOfSets(log.setEntries, metric);
    if (value <= 0) continue;
    byDate.set(log.date, Math.max(byDate.get(log.date) ?? 0, value));
  }
  return [...byDate.entries()]
    .map(([date, value]) => ({ date, value: roundValue(value) }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * グラフで選べる種目（重量を記録したことがある種目）を、記録回数の多い順に返す。
 */
export const weightedTrainingIds = (logs: WorkoutLog[]) => {
  const counts = new Map<string, number>();
  for (const log of logs) {
    if (bestOfSets(log.setEntries, 'maxWeight') <= 0) continue;
    counts.set(log.trainingId, (counts.get(log.trainingId) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
};

/** 目盛りの数の範囲（これより多いと混み合い、少ないと読み取りにくい） */
const MIN_TICKS = 3;
const MAX_TICKS = 6;

/**
 * 見やすい目盛り（1・2・2.5・5 × 10^n 刻み）を作る。値の範囲を必ず含む。
 * 目盛りが MIN_TICKS〜MAX_TICKS 個になる刻みの中から、余白（データのない範囲）が
 * 最も小さいものを選ぶ。同じなら目盛りが 5 個に近いほうを選ぶ。
 * 値が1つだけ（min === max）でも幅を持たせる。
 */
export const niceTicks = (min: number, max: number): number[] => {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    // 1点だけのときは上下に余白を取る
    const pad = Math.max(Math.abs(lo) * 0.1, 1);
    lo -= pad;
    hi += pad;
  }

  const range = hi - lo;
  const baseMagnitude = 10 ** Math.floor(Math.log10(range));
  let best: { start: number; end: number; step: number; score: number } | null =
    null;
  for (const magnitude of [
    baseMagnitude / 10,
    baseMagnitude,
    baseMagnitude * 10,
  ]) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * magnitude;
      const start = Math.floor(lo / step + 1e-9) * step;
      const end = Math.ceil(hi / step - 1e-9) * step;
      const count = Math.round((end - start) / step) + 1;
      if (count < MIN_TICKS || count > MAX_TICKS) continue;
      // 余白の割合を優先し、同じくらいなら目盛りが 5 個に近いほう
      const score = (end - start - range) / range + Math.abs(count - 5) * 0.01;
      if (!best || score < best.score) best = { start, end, step, score };
    }
  }
  // 候補がない（極端な範囲）場合は、両端だけを目盛りにする
  if (!best) return [lo, hi];

  const ticks: number[] = [];
  // 浮動小数の誤差を丸めながら並べる
  for (let v = best.start; v <= best.end + best.step / 2; v += best.step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
};
