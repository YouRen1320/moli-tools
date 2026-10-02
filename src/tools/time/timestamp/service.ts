export type TimeUnit = 's' | 'ms';

/** 时间戳 → Date；非法输入抛出可展示的错误 */
export function unixToDate(input: string, unit: TimeUnit): Date {
  const trimmed = input.trim();
  if (!/^-?\d+$/.test(trimmed)) throw new Error('时间戳必须是纯数字');
  const numeric = Number(trimmed);
  const ms = unit === 's' ? numeric * 1000 : numeric;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new Error('时间戳超出可表示范围');
  return date;
}

/** 日期时间（datetime-local 格式）→ 时间戳字符串；非法输入抛错 */
export function dateToUnix(dateTimeLocal: string, unit: TimeUnit): string {
  const ms = new Date(dateTimeLocal).getTime();
  if (Number.isNaN(ms)) throw new Error('请选择有效的日期时间');
  return unit === 's' ? String(Math.floor(ms / 1000)) : String(ms);
}

export { formatDateTime } from '@lib/format';

export function nowInputValue(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}
