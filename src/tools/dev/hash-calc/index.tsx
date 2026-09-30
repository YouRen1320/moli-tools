import { useRef, useState } from 'react';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import CopyButton from '@components/CopyButton';
import {
  DEFAULT_ALGORITHM,
  hashFile,
  hashText,
  HASH_ALGORITHMS,
  type HashAlgorithm,
} from './service';
import { formatBytes } from '@lib/format';

type Mode = 'text' | 'file';

export default function HashCalc() {
  const [mode, setMode] = useState<Mode>('text');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(DEFAULT_ALGORITHM);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  // 异步哈希的最新请求编号，防止慢请求覆盖新结果
  const requestRef = useRef(0);

  /** 事件驱动的哈希计算：只有最新请求的结果会被采纳 */
  const computeHash = (compute: () => Promise<string>) => {
    const requestId = ++requestRef.current;
    setError(null);
    compute()
      .then((result) => {
        if (requestRef.current === requestId) setHash(result);
      })
      .catch((cause) => {
        if (requestRef.current === requestId) {
          setHash('');
          setError(cause instanceof Error ? cause.message : '哈希计算失败');
        }
      });
  };

  const clearHash = () => {
    requestRef.current += 1;
    setHash('');
    setError(null);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (value === '') {
      clearHash();
    } else {
      computeHash(() => hashText(value, algorithm));
    }
  };

  const handleFileSelect = (files: File[]) => {
    const selected = files[0] ?? null;
    setFile(selected);
    if (selected) {
      computeHash(() => hashFile(selected, algorithm));
    } else {
      clearHash();
    }
  };

  const switchAlgorithm = (next: HashAlgorithm) => {
    setAlgorithm(next);
    if (mode === 'text' && text !== '') {
      computeHash(() => hashText(text, next));
    } else if (mode === 'file' && file) {
      computeHash(() => hashFile(file, next));
    }
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    clearHash();
  };

  return (
    <ToolShell
      icon="🔑"
      title="哈希计算"
      description="计算文本或文件的 SHA-1/256/384/512 摘要，基于浏览器原生 WebCrypto。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex overflow-hidden rounded-full border border-white/60 text-sm">
            {(
              [
                { value: 'text', label: '文本' },
                { value: 'file', label: '文件' },
              ] as { value: Mode; label: string }[]
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => switchMode(item.value)}
                className={`px-4 py-1.5 transition ${
                  mode === item.value
                    ? 'bg-gradient-to-r from-dusk-coral to-dusk-violet text-white'
                    : 'bg-white/60 text-neutral-700 hover:bg-white/85'
                }`}
              >
                {item.label}
              </button>
            ))}
          </span>
          <span className="ml-2 inline-flex overflow-hidden rounded-full border border-white/60 text-sm">
            {HASH_ALGORITHMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchAlgorithm(item)}
                className={`px-3 py-1.5 transition ${
                  algorithm === item
                    ? 'bg-dusk-violet text-white'
                    : 'bg-white/60 text-neutral-700 hover:bg-white/85'
                }`}
              >
                {item}
              </button>
            ))}
          </span>
        </div>

        {mode === 'text' ? (
          <div className="space-y-2">
            <label className="block text-sm text-neutral-600" htmlFor="hash-text">
              输入文本（摘要实时更新）
            </label>
            <textarea
              id="hash-text"
              rows={5}
              className="text-input"
              value={text}
              placeholder="输入任意文本…"
              onChange={(event) => handleTextChange(event.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <FileDrop onFiles={handleFileSelect} hint="任意文件，读取全程在本地完成" />
            {file && (
              <div className="card flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {file.name}
                  <span className="ml-2 text-neutral-400">{formatBytes(file.size)}</span>
                </span>
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={() => handleFileSelect([])}
                >
                  重新选择
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {hash !== '' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">{algorithm} 摘要</p>
            <div className="card flex items-start justify-between gap-3">
              <code className="min-w-0 flex-1 text-xs leading-relaxed break-all">{hash}</code>
              <CopyButton value={hash} />
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
