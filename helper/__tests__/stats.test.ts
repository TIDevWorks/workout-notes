import { WorkoutLog } from '@/constants/training';
import {
  bestOfSets,
  buildSeries,
  estimateOneRm,
  niceTicks,
  roundValue,
  weightedTrainingIds,
} from '@/helper/stats';

const log = (
  trainingId: string,
  date: string,
  setEntries: WorkoutLog['setEntries'],
): WorkoutLog => ({
  id: `${trainingId}-${date}-${Math.random()}`,
  date,
  trainingId,
  category: 'freeWeights',
  setEntries,
  createdAt: 0,
});

describe('estimateOneRm（Epley 式）', () => {
  test('重量 × (1 + 回数 ÷ 30)', () => {
    expect(estimateOneRm(60, 10)).toBeCloseTo(80);
    expect(estimateOneRm(100, 5)).toBeCloseTo(116.667, 2);
  });

  test('1回だけのセットは重量そのもの', () => {
    expect(estimateOneRm(100, 1)).toBe(100);
  });

  test('自重（重量 0）や回数 0 は 0', () => {
    expect(estimateOneRm(0, 15)).toBe(0);
    expect(estimateOneRm(60, 0)).toBe(0);
  });
});

describe('bestOfSets', () => {
  const sets = [
    { weight: 60, reps: 10 }, // 1RM 80
    { weight: 70, reps: 3 }, // 1RM 77
    { weight: 50, reps: 12 }, // 1RM 70
  ];

  test('Max重量はセットの中で最も重い重量', () => {
    expect(bestOfSets(sets, 'maxWeight')).toBe(70);
  });

  test('推定1RMはセットごとに計算した最大値（最も重いセットとは限らない）', () => {
    expect(bestOfSets(sets, 'oneRm')).toBeCloseTo(80);
  });

  test('セットがなければ 0', () => {
    expect(bestOfSets([], 'maxWeight')).toBe(0);
  });
});

describe('roundValue', () => {
  test('小数第1位で丸める', () => {
    expect(roundValue(93.333)).toBe(93.3);
    expect(roundValue(80)).toBe(80);
    expect(roundValue(116.666)).toBe(116.7);
  });
});

describe('buildSeries', () => {
  const logs = [
    log('benchPress', '2026-10-20', [{ weight: 60, reps: 10 }]),
    log('squat', '2026-10-20', [{ weight: 100, reps: 5 }]),
    log('benchPress', '2026-10-05', [{ weight: 55, reps: 8 }]),
    // 同じ日に2回記録した場合は大きいほう
    log('benchPress', '2026-10-20', [{ weight: 65, reps: 3 }]),
  ];

  test('指定した種目だけを、日付の古い順に並べる', () => {
    expect(buildSeries(logs, 'benchPress', 'maxWeight')).toEqual([
      { date: '2026-10-05', value: 55 },
      { date: '2026-10-20', value: 65 },
    ]);
  });

  test('推定1RMでも、同じ日は最大値を使う', () => {
    // 10/20: 60×10 → 80、65×3 → 71.5 のうち 80
    expect(buildSeries(logs, 'benchPress', 'oneRm')).toEqual([
      { date: '2026-10-05', value: 69.7 },
      { date: '2026-10-20', value: 80 },
    ]);
  });

  test('自重（重量 0）だけの日は含めない', () => {
    const bw = [
      log('pullUp', '2026-10-01', [{ weight: 0, reps: 8 }]),
      log('pullUp', '2026-10-08', [{ weight: 10, reps: 5 }]),
    ];
    expect(buildSeries(bw, 'pullUp', 'maxWeight')).toEqual([
      { date: '2026-10-08', value: 10 },
    ]);
  });

  test('記録がなければ空', () => {
    expect(buildSeries(logs, 'deadlift', 'maxWeight')).toEqual([]);
  });
});

describe('weightedTrainingIds', () => {
  test('重量を記録した種目を、記録回数の多い順に返す', () => {
    const logs = [
      log('squat', '2026-10-01', [{ weight: 100, reps: 5 }]),
      log('benchPress', '2026-10-01', [{ weight: 60, reps: 10 }]),
      log('benchPress', '2026-10-08', [{ weight: 60, reps: 10 }]),
      log('pushUp', '2026-10-08', [{ weight: 0, reps: 15 }]),
    ];
    expect(weightedTrainingIds(logs)).toEqual(['benchPress', 'squat']);
  });
});

describe('niceTicks', () => {
  /** 目盛りが満たすべき性質 */
  const expectGoodTicks = (ticks: number[], min: number, max: number) => {
    expect(ticks[0]).toBeLessThanOrEqual(min);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(max);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.length).toBeLessThanOrEqual(6);
  };

  test('範囲を含み、余白が少ない目盛りを選ぶ', () => {
    const ticks = niceTicks(52, 87);
    expectGoodTicks(ticks, 52, 87);
    // 20 刻み（40〜100）より、データにぴったりの 10 刻み（50〜90）
    expect(ticks).toEqual([50, 60, 70, 80, 90]);
  });

  test('重量らしい 2.5 刻みの範囲はそのまま 2.5 刻み', () => {
    expect(niceTicks(20, 27.5)).toEqual([20, 22.5, 25, 27.5]);
  });

  test('いろいろな範囲で性質を満たす', () => {
    for (const [min, max] of [
      [60, 65],
      [5, 12.5],
      [100, 180],
      [40, 41],
      [0.5, 3],
    ]) {
      expectGoodTicks(niceTicks(min, max), min, max);
    }
  });

  test('値が1つだけでも幅を持たせる', () => {
    const ticks = niceTicks(80, 80);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks[0]).toBeLessThan(80);
    expect(ticks[ticks.length - 1]).toBeGreaterThan(80);
  });

  test('目盛りは等間隔で、浮動小数の誤差がない', () => {
    const ticks = niceTicks(0.3, 1.1);
    const steps = ticks.slice(1).map((t, i) => t - ticks[i]);
    for (const s of steps) expect(s).toBeCloseTo(steps[0]);
    for (const t of ticks) expect(String(t)).not.toMatch(/\d{5,}/);
  });
});
