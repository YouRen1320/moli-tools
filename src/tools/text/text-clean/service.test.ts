import { describe, expect, it } from 'vitest';
import { cleanText, DEFAULT_OPTIONS } from './service';

describe('cleanText', () => {
  it('默认：去首尾空格与空行', () => {
    expect(cleanText('  a  \n\n b \nc', DEFAULT_OPTIONS)).toBe('a\nb\nc');
  });

  it('去重保留首次出现顺序', () => {
    const options = { ...DEFAULT_OPTIONS, dedupeLines: true };
    expect(cleanText('b\na\nb\na\nc', options)).toBe('b\na\nc');
  });

  it('排序：中文按拼音升序，可反转', () => {
    const options = { ...DEFAULT_OPTIONS, sortAsc: true };
    expect(cleanText('排名\n爱啊\n白菜', options)).toBe('爱啊\n白菜\n排名');
    const desc = { ...options, sortAsc: false, sortDesc: true };
    expect(cleanText('排名\n爱啊\n白菜', desc)).toBe('排名\n白菜\n爱啊');
  });

  it('全关时不做任何处理（换行符统一为 \n）', () => {
    const options = {
      trimLines: false,
      removeEmptyLines: false,
      dedupeLines: false,
      sortAsc: false,
      sortDesc: false,
    };
    expect(cleanText('a\r\nb', options)).toBe('a\nb');
  });
});
