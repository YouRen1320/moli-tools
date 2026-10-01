export interface CleanOptions {
  trimLines: boolean;
  removeEmptyLines: boolean;
  dedupeLines: boolean;
  sortAsc: boolean;
  sortDesc: boolean;
}

export const DEFAULT_OPTIONS: CleanOptions = {
  trimLines: true,
  removeEmptyLines: true,
  dedupeLines: false,
  sortAsc: false,
  sortDesc: false,
};

/** 逐行清洗文本；按 trim → 去空行 → 去重 → 排序 的顺序执行 */
export function cleanText(text: string, options: CleanOptions): string {
  let lines = text.split(/\r\n|\r|\n/);

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }
  if (options.removeEmptyLines) {
    lines = lines.filter((line) => line !== '');
  }
  if (options.dedupeLines) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
  }
  if (options.sortAsc || options.sortDesc) {
    lines = [...lines].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    if (options.sortDesc) lines.reverse();
  }
  return lines.join('\n');
}
