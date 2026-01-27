/**
 * YYYYMM 文字列を Date に変換
 */
export function parseMonth(month: string): Date {
  const year = Number(month.slice(0, 4));
  const m = Number(month.slice(4, 6)) - 1;
  return new Date(year, m, 1);
}

/**
 * Date → YYYYMM に変換
 */
export function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${y}${m}`;
}

/**
 * 前月を取得
 */
export function getPrevMonth(month: string): string {
  const d = parseMonth(month);
  d.setMonth(d.getMonth() - 1);
  return formatMonth(d);
}

/**
 * 翌月を取得
 */
export function getNextMonth(month: string): string {
  const d = parseMonth(month);
  d.setMonth(d.getMonth() + 1);
  return formatMonth(d);
}

/**
 * 今月（YYYYMM）
 */
export function getCurrentMonth(): string {
  return formatMonth(new Date());
}
