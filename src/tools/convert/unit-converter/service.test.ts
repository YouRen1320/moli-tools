import { describe, expect, it } from 'vitest';
import { convert, formatNumber } from './service';

describe('convert', () => {
  it('长度：公制与市制', () => {
    expect(convert(1, 'length', '千米', '米')).toBe(1000);
    expect(convert(1, 'length', '里', '米')).toBe(500);
    expect(convert(2, 'length', '米', '里')).toBeCloseTo(0.004, 6);
    // 市制：1 米 = 3 尺 = 30 寸
    expect(convert(3, 'length', '尺', '米')).toBeCloseTo(1, 6);
    expect(convert(30, 'length', '寸', '米')).toBeCloseTo(1, 6);
  });

  it('长度：英制', () => {
    expect(convert(1, 'length', '英寸', '厘米')).toBeCloseTo(2.54, 6);
    expect(convert(1, 'length', '英里', '千米')).toBeCloseTo(1.609344, 6);
  });

  it('重量：市制斤两', () => {
    expect(convert(1, 'weight', '斤', '克')).toBe(500);
    expect(convert(1, 'weight', '斤', '两')).toBe(10);
    expect(convert(1000, 'weight', '克', '千克')).toBe(1);
  });

  it('温度：摄氏/华氏/开尔文', () => {
    expect(convert(100, 'temperature', '摄氏度', '华氏度')).toBe(212);
    expect(convert(32, 'temperature', '华氏度', '摄氏度')).toBe(0);
    expect(convert(0, 'temperature', '摄氏度', '开尔文')).toBeCloseTo(273.15, 6);
    expect(convert(0, 'temperature', '开尔文', '摄氏度')).toBeCloseTo(-273.15, 6);
  });

  it('拒绝未知单位', () => {
    expect(() => convert(1, 'length', '光年' as never, '米')).toThrow('不支持');
  });
});

describe('formatNumber', () => {
  it('整数直显、小数去尾零', () => {
    expect(formatNumber(1000)).toBe('1000');
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(2.54)).toBe('2.54');
  });
});
