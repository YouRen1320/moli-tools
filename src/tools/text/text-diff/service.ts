import { diffLines } from 'diff';

export type DiffRowType = 'added' | 'removed' | 'common';

export interface DiffRow {
  type: DiffRowType;
  text: string;
}

export interface DiffResult {
  rows: DiffRow[];
  addedLines: number;
  removedLines: number;
}

/** 逐行对比两段文本，返回带类型的行序列与统计 */
export function diffTexts(oldText: string, newText: string): DiffResult {
  const parts = diffLines(oldText, newText);
  const rows: DiffRow[] = [];
  let addedLines = 0;
  let removedLines = 0;
  for (const part of parts) {
    const type: DiffRowType = part.added ? 'added' : part.removed ? 'removed' : 'common';
    if (part.added) addedLines += countLines(part.value);
    if (part.removed) removedLines += countLines(part.value);
    // 保留每行独立的行号语义：把尾部换行并入该行
    const lines = part.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    for (const line of lines) {
      rows.push({ type, text: line });
    }
  }
  return { rows, addedLines, removedLines };
}

function countLines(value: string): number {
  const lines = value.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines.length;
}
