import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import { formatDateTime } from '@lib/format';
import CopyButton from '@components/CopyButton';
import {
  clearHistory,
  generatePassword,
  entropyBits,
  loadHistory,
  optionsSummary,
  removeFromHistory,
  saveToHistory,
  strengthLabel,
  LIMITS,
  HISTORY_LIMIT,
  type HistoryEntry,
  type PasswordOptions,
} from './service';

const TONE_CLASS: Record<string, string> = {
  weak: 'text-rose-600',
  fair: 'text-amber-600',
  good: 'text-emerald-600',
  strong: 'text-emerald-700',
};

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  const options: PasswordOptions = { length, uppercase, digits, symbols };
  const bits = entropyBits(options);
  const strength = strengthLabel(bits);

  const generate = () => {
    setError(null);
    try {
      const generated = generatePassword(options);
      setPassword(generated);
      // 历史是敏感数据：仅保存在本机浏览器，界面常驻警示并支持一键清空
      setHistory(saveToHistory(generated, options));
    } catch (cause) {
      setPassword('');
      setError(cause instanceof Error ? cause.message : '生成失败');
    }
  };

  const wipeHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const removeEntry = (id: string) => {
    setHistory(removeFromHistory(id));
  };

  const toggles = [
    { label: '大写字母 A-Z', value: uppercase, set: setUppercase },
    { label: '数字 0-9', value: digits, set: setDigits },
    { label: '符号 !@#$', value: symbols, set: setSymbols },
  ];

  return (
    <ToolShell
      icon="🛡️"
      title="密码生成器"
      description="用浏览器加密级随机数生成强密码，长度与字符集可调，附强度评估。"
    >
      <div className="space-y-4">
        <label className="block text-sm text-neutral-700" htmlFor="password-length">
          长度：{length} 位
          <input
            id="password-length"
            type="range"
            min={LIMITS.minLength}
            max={LIMITS.maxLength}
            step={1}
            className="mt-1 w-full accent-dusk-violet"
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
          />
        </label>

        <div className="flex flex-wrap gap-4">
          {toggles.map((item) => (
            <label key={item.label} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(event) => item.set(event.target.checked)}
                className="h-4 w-4 accent-dusk-violet"
              />
              {item.label}
            </label>
          ))}
        </div>

        <p className="text-sm text-neutral-700">
          强度：<strong className={TONE_CLASS[strength.tone]}>{strength.label}</strong>
          <span className="ml-2 text-xs text-neutral-400">约 {bits} bit 熵</span>
        </p>

        <button type="button" className="btn-primary" onClick={generate}>
          生成密码
        </button>

        {history.length === 0 && (
          <p className="text-xs leading-relaxed text-neutral-600">
            生成的密码会暂存在本机浏览器，方便随时复制；可随时一键清空。
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        {password !== '' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">生成的密码</p>
            <div className="card flex items-start justify-between gap-3">
              <code className="min-w-0 flex-1 text-sm leading-relaxed break-all">{password}</code>
              <CopyButton value={password} />
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">
                最近生成（{history.length}/{HISTORY_LIMIT}）
              </p>
              <button type="button" className="btn-secondary" onClick={wipeHistory}>
                清空记录
              </button>
            </div>
            <p className="rounded-lg border border-amber-300/70 bg-amber-100/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
              ⚠️
              密码属于敏感信息：记录仅保存在此浏览器的本地存储中，不上传服务器；请勿在共用电脑上留存，不用时点击"清空记录"立即删除。
            </p>
            <ol className="space-y-2">
              {history.map((entry) => (
                <li key={entry.id} className="card flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    <code className="block truncate text-sm">{entry.password}</code>
                    <span className="text-xs text-neutral-500">
                      {formatDateTime(new Date(entry.time))} · {entry.password.length} 位 ·{' '}
                      {optionsSummary(entry.options)}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <CopyButton value={entry.password} label="复制" />
                    <button
                      type="button"
                      aria-label="删除这条记录"
                      className="btn-secondary px-2 py-1"
                      onClick={() => removeEntry(entry.id)}
                    >
                      删除
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
