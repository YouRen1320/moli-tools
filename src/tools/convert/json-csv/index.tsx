import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import {
  csvToJson,
  getCsvHeader,
  getJsonKeys,
  jsonToCsv,
  sniffDelimiter,
  DELIMITERS,
  type Delimiter,
} from './service';
import { downloadBlob } from '@lib/download';
import { formatFileStamp } from '@lib/format';

type Direction = 'json2csv' | 'csv2json';

const SAMPLE_JSON =
  '[\n  { "name": "茉莉", "age": 3, "city": "杭州" },\n  { "name": "Moli", "age": 4, "city": "Amsterdam" }\n]';
const SAMPLE_CSV = 'name,age,city\n茉莉,3,杭州\nMoli,4,Amsterdam';

/** 超过该长度的输入关闭实时转换（避免大文本渲染期反复解析造成卡顿） */
const LIVE_LIMIT = 256 * 1024;

export default function JsonCsv() {
  const [direction, setDirection] = useState<Direction>('json2csv');
  const [input, setInput] = useState(SAMPLE_JSON);
  const [convertNumbers, setConvertNumbers] = useState(true);
  // JSON→CSV 的列选择：null 表示全选
  const [includeKeys, setIncludeKeys] = useState<string[] | null>(null);
  // CSV→JSON 的表头重命名：按列位置记录新名
  const [headerNames, setHeaderNames] = useState<Record<number, string>>({});
  const [committedInput, setCommittedInput] = useState<string | null>(null);
  // 手动选择优先；缺省从输入首行自动嗅探分隔符
  const [delimiterOverride, setDelimiterOverride] = useState<Delimiter | null>(null);

  // 全部渲染期派生，无副作用。超大输入退出实时模式：
  // live = 派生自当前输入；非 live = 派生自最近一次"转换"确认的内容
  const delimiter = delimiterOverride ?? sniffDelimiter(input);
  const isLive = input.length <= LIVE_LIMIT;
  const source = isLive ? input : (committedInput ?? '');
  const jsonKeys = direction === 'json2csv' ? getJsonKeys(source) : null;
  const csvHeader = direction === 'csv2json' ? getCsvHeader(source, delimiter) : null;

  let output = '';
  let error: string | null = null;
  try {
    output =
      direction === 'json2csv'
        ? jsonToCsv(source, { includeKeys: includeKeys ?? undefined, delimiter })
        : csvToJson(source, { convertNumbers, headerNames, delimiter });
  } catch (cause) {
    error = cause instanceof Error ? cause.message : '转换失败';
  }

  const handleTextChange = (value: string) => {
    setInput(value);
    // 输入变化后列结构可能不同，重置选择状态
    setIncludeKeys(null);
    setHeaderNames({});
  };

  const commit = () => setCommittedInput(input);

  const switchDirection = () => {
    const next: Direction = direction === 'json2csv' ? 'csv2json' : 'json2csv';
    setDirection(next);
    setInput(output || (next === 'csv2json' ? SAMPLE_CSV : SAMPLE_JSON));
    setIncludeKeys(null);
    setHeaderNames({});
    setCommittedInput(null);
    setDelimiterOverride(null);
  };

  const toggleKey = (key: string) => {
    const allKeys = jsonKeys ?? [];
    const base = includeKeys ?? allKeys;
    const next = base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
    setIncludeKeys(next);
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
          <button type="button" className="btn-secondary" onClick={switchDirection}>
            切换方向（用结果继续）
          </button>
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
          <label
            className="ml-auto flex items-center gap-2 text-sm text-neutral-700"
            htmlFor="delimiter-select"
          >
            分隔符
            <select
              id="delimiter-select"
              className="rounded-lg border border-neutral-300 bg-white/70 px-2 py-1.5 text-sm"
              value={delimiter}
              onChange={(event) => setDelimiterOverride(event.target.value as Delimiter)}
            >
              {DELIMITERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* JSON→CSV：列选择 */}
        {direction === 'json2csv' && jsonKeys !== null && jsonKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-600">导出列：</span>
            {jsonKeys.map((key) => {
              const checked = includeKeys === null || includeKeys.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleKey(key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    checked
                      ? 'bg-dusk-violet text-white'
                      : 'border border-white/60 bg-white/60 text-neutral-500 hover:bg-white/85'
                  }`}
                >
                  {checked ? '✓ ' : ''}
                  {key}
                </button>
              );
            })}
          </div>
        )}

        {/* CSV→JSON：表头重命名 */}
        {direction === 'csv2json' && csvHeader !== null && (
          <div className="flex flex-wrap items-end gap-3">
            {csvHeader.map((name, index) => (
              <label key={index} className="text-xs text-neutral-500" htmlFor={`header-${index}`}>
                第 {index + 1} 列：{name === '' ? `column_${index + 1}` : name}
                <input
                  id={`header-${index}`}
                  type="text"
                  className="text-input mt-1 w-32 font-sans"
                  value={headerNames[index] ?? ''}
                  placeholder={name === '' ? `column_${index + 1}` : name}
                  onChange={(event) =>
                    setHeaderNames((prev) => ({ ...prev, [index]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="block text-sm text-neutral-700" htmlFor="jsoncsv-input">
            {direction === 'json2csv' ? '输入 JSON（对象数组）' : '输入 CSV（首行为表头）'}
          </label>
          <label className="btn-secondary cursor-pointer text-xs">
            📂 从文件导入
            <input
              type="file"
              className="hidden"
              accept={
                direction === 'json2csv' ? '.json,application/json' : '.csv,text/csv,text/plain'
              }
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void file.text().then(handleTextChange);
                event.target.value = '';
              }}
            />
          </label>
        </div>
        <textarea
          id="jsoncsv-input"
          rows={8}
          className="text-input"
          value={input}
          onChange={(event) => handleTextChange(event.target.value)}
        />

        {!isLive && (
          <div className="space-y-2">
            <p className="rounded-lg border border-amber-300/70 bg-amber-100/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
              输入超过 256 KB，已切换为手动转换模式。
              {input !== committedInput && ' 输入有更新，点击下方按钮重新转换。'}
            </p>
            <button type="button" className="btn-primary" onClick={commit}>
              转换
            </button>
          </div>
        )}

        {input !== '' && (
          <button type="button" className="btn-secondary" onClick={() => handleTextChange('')}>
            清空
          </button>
        )}

        {error && <p className="error-text">{error}</p>}

        {output !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-neutral-700" htmlFor="jsoncsv-output">
                结果
              </label>
              <span className="flex gap-2">
                <CopyButton value={output} />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    downloadBlob(
                      new Blob([output], {
                        type: direction === 'json2csv' ? 'text/csv' : 'application/json',
                      }),
                      `export-${formatFileStamp()}.${direction === 'json2csv' ? 'csv' : 'json'}`,
                    )
                  }
                >
                  ⬇ 下载文件
                </button>
              </span>
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
