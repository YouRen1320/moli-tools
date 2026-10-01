import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { csvToJson, jsonToCsv } from './service';

type Direction = 'json2csv' | 'csv2json';

const SAMPLE_JSON =
  '[\n  { "name": "茉莉", "age": 3, "city": "杭州" },\n  { "name": "Moli", "age": 4, "city": "Amsterdam" }\n]';
const SAMPLE_CSV = 'name,age,city\n茉莉,3,杭州\nMoli,4,Amsterdam';

export default function JsonCsv() {
  const [direction, setDirection] = useState<Direction>('json2csv');
  const [input, setInput] = useState(SAMPLE_JSON);
  const [convertNumbers, setConvertNumbers] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    try {
      setOutput(direction === 'json2csv' ? jsonToCsv(input) : csvToJson(input, { convertNumbers }));
    } catch (cause) {
      setOutput('');
      setError(cause instanceof Error ? cause.message : '转换失败');
    }
  };

  const switchDirection = () => {
    const next: Direction = direction === 'json2csv' ? 'csv2json' : 'json2csv';
    setDirection(next);
    setInput(output || (next === 'csv2json' ? SAMPLE_CSV : SAMPLE_JSON));
    setOutput('');
    setError(null);
  };

  return (
    <ToolShell
      icon="🔀"
      title="JSON ↔ CSV"
      description="JSON 数组与 CSV 双向转换，RFC 4180 规范转义，数字类型可选。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { value: 'json2csv', label: 'JSON → CSV' },
              { value: 'csv2json', label: 'CSV → JSON' },
            ] as { value: Direction; label: string }[]
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDirection(item.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                direction === item.value
                  ? 'bg-gradient-to-r from-dusk-coral to-dusk-violet text-white'
                  : 'border border-white/60 bg-white/60 text-neutral-700 hover:bg-white/85'
              }`}
            >
              {item.label}
            </button>
          ))}
          {direction === 'csv2json' && (
            <label className="ml-2 flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={convertNumbers}
                onChange={(event) => setConvertNumbers(event.target.checked)}
                className="h-4 w-4 accent-dusk-violet"
              />
              纯数字转数值
            </label>
          )}
        </div>

        <label className="block text-sm text-neutral-700" htmlFor="jsoncsv-input">
          {direction === 'json2csv' ? '输入 JSON（对象数组）' : '输入 CSV（首行为表头）'}
        </label>
        <textarea
          id="jsoncsv-input"
          rows={8}
          className="text-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={run}
            disabled={input.trim() === ''}
          >
            转换
          </button>
          <button type="button" className="btn-secondary" onClick={switchDirection}>
            切换方向（用结果继续）
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {output !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-700" htmlFor="jsoncsv-output">
                结果
              </label>
              <CopyButton value={output} />
            </div>
            <textarea
              id="jsoncsv-output"
              rows={10}
              className="text-input"
              readOnly
              value={output}
            />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
