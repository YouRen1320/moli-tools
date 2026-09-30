/**
 * 解析用户输入的页码表达式（1 起始，闭区间），如 "1,3-5"。
 * 返回升序去重后的页码数组；输入不合法或越界时抛出可直接展示给用户的错误。
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('请输入页码，例如 1,3-5');
  if (pageCount < 1) throw new Error('这份 PDF 没有可提取的页面');

  const collected = new Set<number>();
  for (const part of trimmed.split(/[,，]/)) {
    const segment = part.trim();
    if (!segment) continue;

    const range = segment.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start > end) throw new Error(`页码范围起止颠倒：${segment}`);
      for (let n = start; n <= end; n += 1) collected.add(n);
    } else if (/^\d+$/.test(segment)) {
      collected.add(Number(segment));
    } else {
      throw new Error(`无法识别的页码片段：${segment}`);
    }
  }

  const pages = [...collected].sort((a, b) => a - b);
  if (pages.length === 0) throw new Error('请至少选择一个页码');
  const outOfRange = pages.find((n) => n < 1 || n > pageCount);
  if (outOfRange !== undefined) {
    throw new Error(`页码 ${outOfRange} 超出范围：这份 PDF 共 ${pageCount} 页`);
  }
  return pages;
}
