import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import { generateQrDataUrl, type QrErrorLevel } from './service';

const LEVELS: { value: QrErrorLevel; label: string }[] = [
  { value: 'L', label: 'L（最低，容量最大）' },
  { value: 'M', label: 'M（常用）' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H（最高，抗遮挡）' },
];

export default function Qrcode() {
  const [text, setText] = useState('');
  const [width, setWidth] = useState(256);
  const [level, setLevel] = useState<QrErrorLevel>('M');
  const [dataUrl, setDataUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      setDataUrl(await generateQrDataUrl(text, { width, margin: 2, level }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '生成失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="🧿"
      title="二维码生成"
      description="把链接或文本生成二维码 PNG，可调尺寸与容错等级。"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm text-neutral-600" htmlFor="qr-text">
            内容（链接或任意文本）
          </label>
          <textarea
            id="qr-text"
            rows={5}
            className="text-input"
            placeholder="https://example.com"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex flex-wrap gap-4">
            <label className="text-sm text-neutral-600" htmlFor="qr-width">
              尺寸 {width}px
              <input
                id="qr-width"
                type="range"
                min={128}
                max={640}
                step={32}
                className="mt-1 block w-40 accent-brand-600"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-neutral-600" htmlFor="qr-level">
              容错等级
              <select
                id="qr-level"
                className="mt-1 block rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm"
                value={level}
                onChange={(event) => setLevel(event.target.value as QrErrorLevel)}
              >
                {LEVELS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={generate}
            disabled={busy || text.trim() === ''}
          >
            {busy ? '生成中…' : '生成二维码'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card flex items-center justify-center">
          {dataUrl !== '' ? (
            <a
              href={dataUrl}
              download="qrcode.png"
              className="group text-center"
              aria-label="下载二维码"
            >
              <img
                src={dataUrl}
                alt="生成的二维码"
                className="mx-auto rounded-lg"
                width={width > 320 ? 320 : width}
              />
              <p className="mt-2 text-xs text-neutral-400 group-hover:text-brand-600">
                点击下载 PNG
              </p>
            </a>
          ) : (
            <p className="text-sm text-neutral-400">生成的二维码会显示在这里</p>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
