export function toApiDate(date: string): string {
  // yyyy-MM-dd → yyyyMMdd
  return date.replace(/-/g, '');
}

export function toFormDate(date: string): string {
  // yyyyMMdd → yyyy-MM-dd
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}
