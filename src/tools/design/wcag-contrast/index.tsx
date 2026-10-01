import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import { assessContrast, type WcagResult } from './service';

const BADGES: { key: keyof WcagResult; label: string; hint: string }[] = [
  { key: 'aaNormal', label: 'AA 正常字号', hint: '≥ 4.5' },
  { key: 'aaLarge', label: 'AA 大字号', hint: '≥ 3.0' },
  { key: 'aaaNormal', label: 'AAA 正常字号', hint: '≥ 7.0' },
  { key: 'aaaLarge', label: 'AAA 大字号', hint: '≥ 4.5' },
];

const PRESETS: { fg: string; bg: string }[] = [
  { fg: '#767676', bg: '#ffffff' },
  { fg: '#ff8a5c', bg: '#23235f' },
  { fg: '#ffffff', bg: '#f468a7' },
];

export default function WcagContrast() {
  const [foreground, setForeground] = useState('#23235f');
  const [background, setBackground] = useState('#ffffff');

  let error: string | null = null;
  let result: WcagResult | null = null;
  try {
    result = assessContrast(foreground, background);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : '无法解析颜色';
  }

  const colorInput = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <label className="text-sm text-neutral-700" htmlFor={id}>
      {label}
      <span className="mt-1 flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label}拾色器`}
          className="h-9 w-12 cursor-pointer rounded-lg border border-white/60 bg-transparent"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          id={id}
          type="text"
          className="text-input flex-1 font-mono"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );

  return (
    <ToolShell
      icon="🔍"
      title="对比度检查"
      description="检查前景与背景色的 WCAG 对比度，标注 AA/AAA 达标情况。"
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {colorInput('wcag-fg', '前景色（文字）', foreground, setForeground)}
          {colorInput('wcag-bg', '背景色', background, setBackground)}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-600">试试：</span>
          {PRESETS.map((preset) => (
            <button
              key={`${preset.fg}-${preset.bg}`}
              type="button"
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => {
                setForeground(preset.fg);
                setBackground(preset.bg);
              }}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full align-middle"
                style={{ backgroundColor: preset.fg, boxShadow: `0 0 0 2px ${preset.bg}` }}
              />{' '}
              {preset.fg} / {preset.bg}
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        {result && (
          <>
            <div className="card flex items-center gap-4">
              <p className="text-4xl font-bold text-dusk-violet">
                {result.ratio.toFixed(2)}
                <span className="text-base font-medium text-neutral-400">:1</span>
              </p>
              <div
                className="flex-1 rounded-xl border border-white/50 p-3 text-center"
                style={{ backgroundColor: background, color: foreground }}
              >
                <p className="text-sm">正常字号的文字示例 Aa</p>
                <p className="text-xl font-bold">大字号的文字示例 Aa</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BADGES.map((badge) => {
                const pass = result[badge.key];
                return (
                  <div
                    key={badge.key}
                    className={`card p-3 text-center ${pass ? 'border-emerald-400/70' : 'border-rose-300/70'}`}
                  >
                    <p
                      className={`text-lg font-bold ${pass ? 'text-emerald-600' : 'text-rose-500'}`}
                    >
                      {pass ? '✓ 通过' : '✗ 未过'}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      {badge.label}（{badge.hint}）
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
