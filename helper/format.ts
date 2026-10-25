// helper/format.ts
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Date を YYYY-MM-DD（ローカル時刻）に変換 */
export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** YYYY-MM-DD を Date（ローカル時刻）に変換 */
export const parseDateString = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** 月の最初と最後の日付（YYYY-MM-DD）。month は 1〜12 */
export const monthRange = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

/** 例: 10月25日（日）・今日 */
export const formatDayLabel = (dateString: string, today: string) => {
  const date = parseDateString(dateString);
  const label = `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;
  return dateString === today ? `${label}・今日` : label;
};

/** 例: 60 kg × 10 reps × 3 sets / 自重 × 15 reps × 3 sets */
export const formatTrainingDetail = (
  weight: number,
  reps: number,
  sets: number,
) => `${weight ? `${weight} kg` : '自重'} × ${reps} reps × ${sets} sets`;

export { WEEKDAYS };
