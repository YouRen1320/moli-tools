import { describe, expect, it } from 'vitest';
import { diffTexts } from './service';

describe('diffTexts', () => {
  it('标出新增与删除的行', () => {
    const result = diffTexts('第一行\n第二行\n第三行', '第一行\n改过的第二行\n第三行');
    expect(result.removedLines).toBe(1);
    expect(result.addedLines).toBe(1);
    const removed = result.rows.find((row) => row.type === 'removed');
    const added = result.rows.find((row) => row.type === 'added');
    expect(removed?.text).toBe('第二行');
    expect(added?.text).toBe('改过的第二行');
  });

  it('相同文本无差异', () => {
    const result = diffTexts('a\nb', 'a\nb');
    expect(result.addedLines).toBe(0);
    expect(result.removedLines).toBe(0);
    expect(result.rows.every((row) => row.type === 'common')).toBe(true);
  });

  it('统计多行增删', () => {
    const result = diffTexts('a\nb\nc', 'a\nx\ny\nc');
    expect(result.removedLines).toBe(1);
    expect(result.addedLines).toBe(2);
  });
});
