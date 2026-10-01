export type UnitCategory = 'length' | 'weight' | 'temperature';

interface UnitDef {
  /** 相对该类别的基准单位的倍率（温度除外） */
  factor: number;
  label: string;
}

export const UNIT_TABLE: Record<Exclude<UnitCategory, 'temperature'>, Record<string, UnitDef>> = {
  length: {
    毫米: { factor: 0.001, label: '毫米 (mm)' },
    厘米: { factor: 0.01, label: '厘米 (cm)' },
    米: { factor: 1, label: '米 (m)' },
    千米: { factor: 1000, label: '千米 (km)' },
    寸: { factor: 1 / 30, label: '寸（市制）' },
    尺: { factor: 1 / 3, label: '尺（市制）' },
    里: { factor: 500, label: '里（市制）' },
    英寸: { factor: 0.0254, label: '英寸 (in)' },
    英尺: { factor: 0.3048, label: '英尺 (ft)' },
    英里: { factor: 1609.344, label: '英里 (mi)' },
  },
  weight: {
    克: { factor: 1, label: '克 (g)' },
    千克: { factor: 1000, label: '千克 (kg)' },
    吨: { factor: 1_000_000, label: '吨 (t)' },
    两: { factor: 50, label: '两（市制）' },
    斤: { factor: 500, label: '斤（市制）' },
    盎司: { factor: 28.349523125, label: '盎司 (oz)' },
    磅: { factor: 453.59237, label: '磅 (lb)' },
  },
};

export const TEMPERATURE_UNITS = ['摄氏度', '华氏度', '开尔文'] as const;
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export function listUnits(category: UnitCategory): string[] {
  if (category === 'temperature') return [...TEMPERATURE_UNITS];
  return Object.keys(UNIT_TABLE[category]);
}

export function convert(value: number, category: UnitCategory, from: string, to: string): number {
  if (category === 'temperature') {
    return convertTemperature(value, from as TemperatureUnit, to as TemperatureUnit);
  }
  const table = UNIT_TABLE[category];
  if (!table[from] || !table[to]) throw new Error('不支持的单位');
  return (value * table[from].factor) / table[to].factor;
}

function celsiusToKelvin(c: number): number {
  return c + 273.15;
}

function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  // 统一转成摄氏度中转
  let celsius: number;
  switch (from) {
    case '摄氏度':
      celsius = value;
      break;
    case '华氏度':
      celsius = ((value - 32) * 5) / 9;
      break;
    case '开尔文':
      celsius = value - 273.15;
      break;
  }
  switch (to) {
    case '摄氏度':
      return celsius;
    case '华氏度':
      return (celsius * 9) / 5 + 32;
    case '开尔文':
      return celsiusToKelvin(celsius);
  }
}

/** 展示格式化：整数直接显示，小数最多保留 6 位有效并去掉尾零 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (Number.isInteger(value)) return String(value);
  return String(parseFloat(value.toFixed(6)));
}
