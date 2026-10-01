import { hexToRgb, type Rgb } from '@lib/color';

export interface WcagResult {
  /** 对比度比值（1-21） */
  ratio: number;
  /** 正常字号 AA：≥ 4.5 */
  aaNormal: boolean;
  /** 大字号 AA：≥ 3.0 */
  aaLarge: boolean;
  /** 正常字号 AAA：≥ 7.0 */
  aaaNormal: boolean;
  /** 大字号 AAA：≥ 4.5 */
  aaaLarge: boolean;
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x 相对亮度 */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const la = relativeLuminance(foreground);
  const lb = relativeLuminance(background);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function assessContrast(foregroundHex: string, backgroundHex: string): WcagResult {
  const ratio = contrastRatio(hexToRgb(foregroundHex), hexToRgb(backgroundHex));
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}
