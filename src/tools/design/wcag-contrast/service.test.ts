import { describe, expect, it } from 'vitest';
import { assessContrast, contrastRatio, relativeLuminance } from './service';

describe('contrastRatio', () => {
  it('黑白对比度满分 21', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 2);
  });

  it('比值与输入顺序无关', () => {
    const a = contrastRatio({ r: 255, g: 138, b: 92 }, { r: 255, g: 255, b: 255 });
    const b = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 255, g: 138, b: 92 });
    expect(a).toBe(b);
  });

  it('相对亮度：纯红为 0.2126', () => {
    expect(relativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 4);
  });
});

describe('assessContrast（WCAG 已知向量）', () => {
  it('白底 #767676 是能过 AA 的最深灰（约 4.54）', () => {
    const result = assessContrast('#767676', '#ffffff');
    expect(result.ratio).toBeCloseTo(4.54, 2);
    expect(result.aaNormal).toBe(true);
    expect(result.aaLarge).toBe(true);
    expect(result.aaaNormal).toBe(false);
  });

  it('白底纯红约 4.0：过 AA 大字号，不过 AA 正常字号', () => {
    const result = assessContrast('#ff0000', '#ffffff');
    expect(result.ratio).toBeCloseTo(4.0, 1);
    expect(result.aaNormal).toBe(false);
    expect(result.aaLarge).toBe(true);
  });

  it('非法颜色报错', () => {
    expect(() => assessContrast('#12', '#ffffff')).toThrow('3 位或 6 位');
  });
});
