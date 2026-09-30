export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** HSL 用浮点存储（不取整），保证与 RGB 往返无损；仅在展示层取整 */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): Rgb {
  const raw = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(raw) || (raw.length !== 3 && raw.length !== 6)) {
    throw new Error('请输入 3 位或 6 位十六进制颜色，例如 #ff8a5c');
  }
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  const value = parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + ((h % 360) + 360) / 30) % 12;
    return ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

export function formatHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function formatCssRgb({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatCssHsl({ h, s, l }: Hsl): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/** 接受 HEX / rgb(...) / hsl(...) 三种输入，返回三套表示 */
export function parseColor(input: string): { hex: string; rgb: Rgb; hsl: Hsl } {
  const text = input.trim();
  if (text === '') throw new Error('请输入颜色值');

  const rgbMatch = text.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i);
  if (rgbMatch) {
    const rgb = {
      r: Math.min(255, Number(rgbMatch[1])),
      g: Math.min(255, Number(rgbMatch[2])),
      b: Math.min(255, Number(rgbMatch[3])),
    };
    return { hex: formatHex(rgb), rgb, hsl: rgbToHsl(rgb) };
  }

  const hslMatch = text.match(/^hsla?\(\s*(\d{1,3})[\s,]+(\d{1,3})%?[\s,]+(\d{1,3})%?/i);
  if (hslMatch) {
    const hsl = { h: Number(hslMatch[1]), s: Number(hslMatch[2]), l: Number(hslMatch[3]) };
    const rgb = hslToRgb(hsl);
    return { hex: formatHex(rgb), rgb, hsl };
  }

  const rgb = hexToRgb(text.startsWith('#') ? text : `#${text}`);
  return { hex: formatHex(rgb), rgb, hsl: rgbToHsl(rgb) };
}
