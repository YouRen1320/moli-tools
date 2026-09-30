import { describe, expect, it } from 'vitest';
import { dateToUnix, formatDateTime, nowInputValue, unixToDate } from './service';

describe('unixToDate', () => {
  it('解析秒级时间戳', () => {
    expect(formatDateTime(unixToDate('1700000000', 's'))).toBe('2023-11-15 06:13:20');
  });

  it('解析毫秒级时间戳', () => {
    expect(formatDateTime(unixToDate('1700000000000', 'ms'))).toBe('2023-11-15 06:13:20');
  });

  it('拒绝非数字', () => {
    expect(() => unixToDate('abc', 's')).toThrow('纯数字');
  });
});

describe('dateToUnix', () => {
  it('日期时间转秒级时间戳', () => {
    expect(dateToUnix('2023-11-15T06:13:20', 's')).toBe('1700000000');
  });

  it('日期时间转毫秒级时间戳', () => {
    expect(dateToUnix('2023-11-15T06:13:20', 'ms')).toBe('1700000000000');
  });

  it('拒绝空输入', () => {
    expect(() => dateToUnix('', 's')).toThrow('有效的日期时间');
  });
});

describe('nowInputValue', () => {
  it('输出 datetime-local 兼容格式', () => {
    expect(nowInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });
});
