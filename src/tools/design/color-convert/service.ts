/**
 * 颜色换算的纯函数实现在 @lib/color（供 WCAG 对比度等工具复用），
 * 这里保持本工具的原有导出不变。
 */
export {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  formatHex,
  formatCssRgb,
  formatCssHsl,
  parseColor,
} from '@lib/color';
export type { Rgb, Hsl } from '@lib/color';
