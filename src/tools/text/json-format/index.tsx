import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { formatJson, minifyJson, type JsonIndent } from './service';

type Action = 'format' | 'minify';

const INDENTS: { value: JsonIndent; label: string }[] = [
  { value: 2, label: '2 空格' },
  { value: 4, label: '4 空格' },
  { value: '\t', label: 'Tab' },
];

export default function JsonFormat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [error, setError] = useState<string | null>(null);

  const run = (action: Action) => {
    setError(null);
    try {
      setOutput(action === 'format' ? formatJson(input, indent) : minifyJson(input));
    } catch (cause) {
      setOutput('');
      setError(cause instanceof Error ? cause.message : 'JSON 解析失败');
    }
  };

  return (
    <ToolShell
      icon="🧾"
      title="JSON 格式化"
      description="格式化、压缩与校验 JSON，出错时提示具体位置。"
    >
      <div className="space-y-4">
        <label className="block text-sm text-neutral-600" htmlFor="json-input">
          输入 JSON
        </label>
        <textarea
          id="json-input"
          rows={8}
          className="text-input"
          value={input}
          placeholder='{"hello": "world"}'
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={() => run('format')}>
            格式化
          </button>
          <button type="button" className="btn-secondary" onClick={() => run('minify')}>
            压缩
          </button>
          <label
            className="ml-2 flex items-center gap-2 text-sm text-neutral-600"
            htmlFor="indent-select"
          >
            缩进
            <select
              id="indent-select"
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm"
              value={String(indent)}
              onChange={(event) =>
                setIndent(
                  event.target.value === '\t' ? '\t' : (Number(event.target.value) as 2 | 4),
                )
              }
            >
              {INDENTS.map((item) => (
                <option key={String(item.value)} value={String(item.value)}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        {output !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-600" htmlFor="json-output">
                结果
              </label>
              <CopyButton value={output} />
            </div>
            <textarea id="json-output" rows={10} className="text-input" readOnly value={output} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
