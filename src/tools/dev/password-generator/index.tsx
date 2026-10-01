import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import {
  generatePassword,
  entropyBits,
  strengthLabel,
  LIMITS,
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

  const options: PasswordOptions = { length, uppercase, digits, symbols };
  const bits = entropyBits(options);
  const strength = strengthLabel(bits);

  const generate = () => {
    setError(null);
    try {
      setPassword(generatePassword(options));
    } catch (cause) {
      setPassword('');
      setError(cause instanceof Error ? cause.message : '生成失败');
    }
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
        <label className="block text-sm text-neutral-600" htmlFor="password-length">
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

        <p className="text-sm text-neutral-600">
          强度：<strong className={TONE_CLASS[strength.tone]}>{strength.label}</strong>
          <span className="ml-2 text-xs text-neutral-400">约 {bits} bit 熵</span>
        </p>

        <button type="button" className="btn-primary" onClick={generate}>
          生成密码
        </button>

        {error && <p className="error-text">{error}</p>}

        {password !== '' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">生成的密码</p>
            <div className="card flex items-start justify-between gap-3">
              <code className="min-w-0 flex-1 text-sm leading-relaxed break-all">{password}</code>
              <CopyButton value={password} />
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
