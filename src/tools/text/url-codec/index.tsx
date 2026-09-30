import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { decodeUrlText, encodeUrlText, type UrlMode } from './service';

type Action = 'encode' | 'decode';

const MODE_LABELS: { value: UrlMode; label: string; hint: string }[] = [
  { value: 'component', label: 'URL 组件', hint: '编码所有保留字符（参数值用这个）' },
  { value: 'full', label: '完整 URL', hint: '保留 ://?=&# 等结构符' },
];

export default function UrlCodec() {
  const [mode, setMode] = useState<UrlMode>('component');
  const [action, setAction] = useState<Action>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    try {
      setOutput(action === 'encode' ? encodeUrlText(input, mode) : decodeUrlText(input, mode));
    } catch (cause) {
      setOutput('');
      setError(cause instanceof Error ? cause.message : '转换失败');
    }
  };

  const swap = () => {
    setAction(action === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
    setError(null);
  };

  return (
    <ToolShell
      icon="🔗"
      title="URL 编解码"
      description="URL 组件与完整 URL 两种模式的百分号编码互转。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {MODE_LABELS.map((item) => (
            <button
              key={item.value}
              type="button"
              title={item.hint}
              onClick={() => setMode(item.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === item.value
                  ? 'bg-gradient-to-r from-dusk-coral to-dusk-violet text-white'
                  : 'border border-white/60 bg-white/60 text-neutral-700 hover:bg-white/85'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="block text-sm text-neutral-600" htmlFor="url-input">
          {action === 'encode' ? '要编码的文本' : '要解码的字符串'}
        </label>
        <textarea
          id="url-input"
          rows={5}
          className="text-input"
          value={input}
          placeholder={
            action === 'encode'
              ? 'https://example.com/搜索?q=词'
              : 'https://example.com/%E6%90%9C%E7%B4%A2'
          }
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            aria-label={action === 'encode' ? '执行编码' : '执行解码'}
            onClick={run}
            disabled={input.trim() === ''}
          >
            {action === 'encode' ? '编码' : '解码'}
          </button>
          <button type="button" className="btn-secondary" onClick={swap} disabled={output === ''}>
            用结果反向转换
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {output !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-600" htmlFor="url-output">
                结果
              </label>
              <CopyButton value={output} />
            </div>
            <textarea id="url-output" rows={5} className="text-input" readOnly value={output} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
