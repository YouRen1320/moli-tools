import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { decodeBase64, encodeBase64 } from './service';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    try {
      setOutput(mode === 'encode' ? encodeBase64(input) : decodeBase64(input));
    } catch {
      setError('解码失败：输入看起来不是合法的 Base64');
    }
  };

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
    setError(null);
  };

  return (
    <ToolShell
      icon="🔐"
      title="Base64 编解码"
      description="文本与 Base64 互转，UTF-8 安全，中文不乱码。"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {(['encode', 'decode'] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === value
                  ? 'bg-dusk-violet text-white'
                  : 'border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {value === 'encode' ? '编码' : '解码'}
            </button>
          ))}
        </div>

        <label className="block text-sm text-neutral-600" htmlFor="base64-input">
          {mode === 'encode' ? '要编码的文本' : '要解码的 Base64'}
        </label>
        <textarea
          id="base64-input"
          rows={5}
          className="text-input"
          value={input}
          placeholder={mode === 'encode' ? '输入任意文本，支持中文与 emoji' : '粘贴 Base64 字符串'}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            aria-label={mode === 'encode' ? '执行编码' : '执行解码'}
            onClick={run}
            disabled={input.trim() === ''}
          >
            {mode === 'encode' ? '编码' : '解码'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={swapMode}
            disabled={output === ''}
          >
            用结果反向转换
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {output !== '' && (
          <div className="space-y-2">
            <label className="block text-sm text-neutral-600" htmlFor="base64-output">
              结果
            </label>
            <textarea id="base64-output" rows={5} className="text-input" readOnly value={output} />
            <CopyButton value={output} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
