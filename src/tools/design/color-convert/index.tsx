import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { formatCssHsl, formatCssRgb, parseColor } from './service';

const PRESETS = ['#ff8a5c', '#f468a7', '#8a63e8', '#23235f', '#ffe3b0'];

export default function ColorConvert() {
  const [input, setInput] = useState('#ff8a5c');

  let error: string | null = null;
  let parsed: { hex: string; rgbText: string; hslText: string } | null = null;
  try {
    const result = parseColor(input);
    parsed = {
      hex: result.hex,
      rgbText: formatCssRgb(result.rgb),
      hslText: formatCssHsl(result.hsl),
    };
  } catch (cause) {
    error = cause instanceof Error ? cause.message : '无法解析颜色';
  }

  const rows = parsed
    ? [
        { label: 'HEX', value: parsed.hex },
        { label: 'RGB', value: parsed.rgbText },
        { label: 'HSL', value: parsed.hslText },
      ]
    : [];

  return (
    <ToolShell
      icon="🎨"
      title="颜色转换"
      description="HEX / RGB / HSL 互转，实时预览，支持三种格式直接输入。"
    >
      <div className="space-y-4">
        <label className="block text-sm text-neutral-600" htmlFor="color-input">
          颜色值（如 #ff8a5c、rgb(255, 138, 92)、hsl(17, 100%, 68%)）
        </label>
        <input
          id="color-input"
          type="text"
          className="text-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="#ff8a5c"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">快捷色板：</span>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`使用 ${preset}`}
              onClick={() => setInput(preset)}
              className="h-7 w-7 rounded-lg border border-white/70 shadow-sm transition hover:scale-110"
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>

        {error && input.trim() !== '' && <p className="error-text">{error}</p>}

        {parsed && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div
              className="h-32 w-full shrink-0 rounded-2xl border border-white/60 shadow-inner sm:w-40"
              style={{ backgroundColor: parsed.hex }}
              aria-hidden
            />
            <div className="w-full space-y-2">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/55 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400">{row.label}</p>
                    <code className="block truncate text-sm">{row.value}</code>
                  </div>
                  <CopyButton value={row.value} label="复制" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
