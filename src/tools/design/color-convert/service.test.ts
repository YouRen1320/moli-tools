import { describe, expect, it } from 'vitest';
import {
  formatCssHsl,
  formatCssRgb,
  formatHex,
  hexToRgb,
  hslToRgb,
  parseColor,
  rgbToHsl,
} from './service';

describe('hexToRgb', () => {
  it('解析 6 位与 3 位十六进制', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(hexToRgb('ff8a5c')).toEqual({ r: 255, g: 138, b: 92 });
  });

  it('拒绝非法输入', () => {
    expect(() => hexToRgb('#12')).toThrow('3 位或 6 位');
    expect(() => hexToRgb('#gggggg')).toThrow('3 位或 6 位');
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('标准向量', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    const green = rgbToHsl({ r: 0, g: 128, b: 0 });
    expect(green.h).toBe(120);
    expect(green.s).toBeCloseTo(100);
    expect(formatCssHsl(green)).toBe('hsl(120, 100%, 25%)');
    expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('HEX → HSL → RGB 往返无损', () => {
    for (const hex of ['#ff8a5c', '#4f46e5', '#23235f', '#f468a7', '#ffe3b0', '#000000']) {
      const rgb = hexToRgb(hex);
      const back = hslToRgb(rgbToHsl(rgb));
      expect(formatHex(back)).toBe(hex.toLowerCase());
    }
  });
});

describe('parseColor', () => {
  it('接受三种格式并返回统一表示', () => {
    const fromHex = parseColor('#ff0000');
    expect(fromHex.hex).toBe('#ff0000');
    expect(fromHex.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(fromHex.hsl.h).toBe(0);

    expect(parseColor('rgb(0, 128, 0)').hex).toBe('#008000');
    expect(parseColor('hsl(120, 100%, 25%)').hex).toBe('#008000');
  });

  it('空输入给出可读错误', () => {
    expect(() => parseColor('   ')).toThrow('请输入颜色值');
  });
});

describe('formatCss* 输出', () => {
  it('生成标准 CSS 字符串', () => {
    expect(formatCssRgb({ r: 255, g: 138, b: 92 })).toBe('rgb(255, 138, 92)');
    expect(formatHex({ r: 255, g: 138, b: 92 })).toBe('#ff8a5c');
  });
});
