import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { dateToUnix, formatDateTime, nowInputValue, unixToDate, type TimeUnit } from './service';

function UnitSwitch({ unit, onChange }: { unit: TimeUnit; onChange: (u: TimeUnit) => void }) {
  return (
    <span className="inline-flex overflow-hidden rounded-lg border border-neutral-300 text-sm">
      {(['s', 'ms'] as TimeUnit[]).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 transition ${
            unit === value
              ? 'bg-dusk-violet text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {value === 's' ? '秒' : '毫秒'}
        </button>
      ))}
    </span>
  );
}

/** 渲染期直接求值（无副作用），错误作为普通值展示 */
function evaluateUnixToDate(input: string, unit: TimeUnit): string {
  if (input.trim() === '') return '';
  try {
    return formatDateTime(unixToDate(input, unit));
  } catch (cause) {
    return cause instanceof Error ? cause.message : '输入有误';
  }
}

function evaluateDateToUnix(dateTimeLocal: string, unit: TimeUnit): string {
  if (dateTimeLocal === '') return '';
  try {
    return dateToUnix(dateTimeLocal, unit);
  } catch {
    return '';
  }
}

export default function Timestamp() {
  const [unixInput, setUnixInput] = useState('');
  const [fromUnixUnit, setFromUnixUnit] = useState<TimeUnit>('s');
  const [dateValue, setDateValue] = useState(nowInputValue());
  const [toUnixUnit, setToUnixUnit] = useState<TimeUnit>('s');

  const dateResult = evaluateUnixToDate(unixInput, fromUnixUnit);
  const unixResult = evaluateDateToUnix(dateValue, toUnixUnit);

  return (
    <ToolShell
      icon="⏱️"
      title="时间戳转换"
      description="Unix 时间戳与日期时间互转，支持秒/毫秒，一键取当前时间。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-3">
          <h2 className="text-sm font-semibold text-neutral-700">时间戳 → 日期时间</h2>
          <input
            type="text"
            className="text-input"
            placeholder="例如 1700000000"
            value={unixInput}
            onChange={(event) => setUnixInput(event.target.value)}
            aria-label="Unix 时间戳"
          />
          <UnitSwitch unit={fromUnixUnit} onChange={setFromUnixUnit} />
          {dateResult !== '' && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2">
              <code className="text-sm">{dateResult}</code>
              <CopyButton value={dateResult} label="复制" />
            </div>
          )}
        </section>

        <section className="card space-y-3">
          <h2 className="text-sm font-semibold text-neutral-700">日期时间 → 时间戳</h2>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              step={1}
              className="text-input font-sans"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              aria-label="日期时间"
            />
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => setDateValue(nowInputValue())}
            >
              现在
            </button>
          </div>
          <UnitSwitch unit={toUnixUnit} onChange={setToUnixUnit} />
          {unixResult !== '' && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2">
              <code className="text-sm">{unixResult}</code>
              <CopyButton value={unixResult} label="复制" />
            </div>
          )}
        </section>
      </div>
    </ToolShell>
  );
}
