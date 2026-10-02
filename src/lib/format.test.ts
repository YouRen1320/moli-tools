import { describe, expect, it } from 'vitest';
import { formatDateTime, formatFileStamp } from './format';

// vitest.setup.ts 固定 TZ=Asia/Shanghai
describe('formatFileStamp', () => {
  it('输出文件名安全的时间戳', () => {
    expect(formatFileStamp(new Date('2026-10-01T09:05:03'))).toBe('20261001-090503');
  });
});

describe('formatDateTime', () => {
  it('输出 YYYY-MM-DD HH:mm:ss', () => {
    expect(formatDateTime(new Date('2023-11-15T06:13:20'))).toBe('2023-11-15 06:13:20');
  });
});
