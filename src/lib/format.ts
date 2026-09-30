export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** 压缩节省百分比，四舍五入到整数，结果限制在 0-100 */
export function savedPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((1 - after / before) * 100)));
}
