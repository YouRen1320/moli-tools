import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { compressImage, resolveOutputName, type OutputFormat } from './service';
import { downloadBlob } from '@lib/download';
import { formatBytes, savedPercent } from '@lib/format';

interface Result {
  name: string;
  before: number;
  after: number;
  blob: Blob;
}

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'webp', label: 'WebP（推荐）' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG（无损）' },
];

export default function ImageCompress() {
  const [results, setResults] = useState<Result[]>([]);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState(0.7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (files: File[]) => {
    setBusy(true);
    setError(null);
    try {
      const next: Result[] = [];
      for (const file of files) {
        const blob = await compressImage(file, { format, quality });
        next.push({ name: file.name, before: file.size, after: blob.size, blob });
      }
      setResults(next);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message.includes('图片解码') ? '请选择常见格式的图片（JPG/PNG/WebP/GIF）' : message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="🖼️"
      title="图片压缩"
      description="在浏览器里把图片重新编码为 WebP/JPEG/PNG，调节质量控制体积。"
    >
      <div className="space-y-4">
        <div className="card flex flex-wrap items-end gap-4">
          <label className="text-sm text-neutral-600" htmlFor="format-select">
            输出格式
            <select
              id="format-select"
              className="text-input mt-1 w-44 font-sans"
              value={format}
              onChange={(event) => setFormat(event.target.value as OutputFormat)}
            >
              {FORMATS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-48 flex-1 text-sm text-neutral-600" htmlFor="quality-range">
            质量：{Math.round(quality * 100)}%
            {format === 'png' && (
              <span className="ml-1 text-xs text-neutral-400">（PNG 无损，此项不生效）</span>
            )}
            <input
              id="quality-range"
              type="range"
              className="mt-1 w-full accent-brand-600"
              min={0.1}
              max={0.95}
              step={0.05}
              value={quality}
              disabled={format === 'png'}
              onChange={(event) => setQuality(Number(event.target.value))}
            />
          </label>
        </div>

        <FileDrop
          accept="image/*"
          multiple
          onFiles={run}
          hint={busy ? '压缩中…' : '支持多选，处理全程在本地完成'}
        />

        {error && <p className="error-text">{error}</p>}

        {results.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2">文件</th>
                <th className="py-2">原始</th>
                <th className="py-2">压缩后</th>
                <th className="py-2">节省</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.name} className="border-t border-neutral-100">
                  <td className="max-w-48 truncate py-2">{result.name}</td>
                  <td className="py-2 text-neutral-500">{formatBytes(result.before)}</td>
                  <td className="py-2">{formatBytes(result.after)}</td>
                  <td className="py-2 text-brand-700">
                    {savedPercent(result.before, result.after)}%
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        downloadBlob(result.blob, resolveOutputName(result.name, format))
                      }
                    >
                      下载
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ToolShell>
  );
}
