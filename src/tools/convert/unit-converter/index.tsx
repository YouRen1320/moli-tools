import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { convert, formatNumber, listUnits, type UnitCategory } from './service';

const CATEGORIES: { value: UnitCategory; label: string }[] = [
  { value: 'length', label: '长度' },
  { value: 'weight', label: '重量' },
  { value: 'temperature', label: '温度' },
];

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [valueText, setValueText] = useState('1');
  const [fromUnit, setFromUnit] = useState('米');

  const units = listUnits(category);
  const from = units.includes(fromUnit) ? fromUnit : units[0];

  let numericValue: number | null = null;
  let parseError: string | null = null;
  const parsed = Number(valueText);
  if (valueText.trim() === '') {
    parseError = null;
  } else if (Number.isNaN(parsed)) {
    parseError = '请输入数字';
  } else {
    numericValue = parsed;
  }

  const rows =
    numericValue === null
      ? []
      : units.map((unit) => ({
          unit,
          value: formatNumber(convert(numericValue, category, from, unit)),
        }));

  return (
    <ToolShell
      icon="⚖️"
      title="单位换算"
      description="长度、重量、温度互转，支持中文习惯单位（里、丈、斤、两）。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value);
                setFromUnit(listUnits(item.value)[0]);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === item.value
                  ? 'bg-gradient-to-r from-dusk-coral to-dusk-violet text-white'
                  : 'border border-white/60 bg-white/60 text-neutral-700 hover:bg-white/85'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-neutral-700" htmlFor="unit-value">
            数值
            <input
              id="unit-value"
              type="text"
              inputMode="decimal"
              className="text-input mt-1 w-40"
              value={valueText}
              placeholder="例如 1"
              onChange={(event) => setValueText(event.target.value)}
            />
          </label>
          <label className="text-sm text-neutral-700" htmlFor="unit-from">
            单位
            <select
              id="unit-from"
              className="mt-1 block rounded-lg border border-neutral-300 bg-white/70 px-2 py-2 text-sm"
              value={from}
              onChange={(event) => setFromUnit(event.target.value)}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        {parseError && <p className="error-text">{parseError}</p>}

        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">换算结果</p>
              <CopyButton
                value={rows.map((row) => `${row.unit}\t${row.value}`).join('\n')}
                label="复制全部"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {rows.map((row) => (
                <div
                  key={row.unit}
                  className={`card flex items-center justify-between gap-3 py-2 ${
                    row.unit === from ? 'border-dusk-violet/60' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-600">{row.unit}</span>
                  <strong className="text-sm">{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
