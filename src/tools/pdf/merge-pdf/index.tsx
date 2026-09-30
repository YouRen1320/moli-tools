import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { mergePdfs, type PdfInput } from './service';
import { downloadBytes } from '@lib/download';
import { formatBytes } from '@lib/format';

interface Item extends PdfInput {
  size: number;
}

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: File[]) => {
    const pdfs = files.filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
    );
    if (pdfs.length === 0) {
      setError('请选择 PDF 文件');
      return;
    }
    setError(null);
    const loaded: Item[] = await Promise.all(
      pdfs.map(async (file) => ({
        name: file.name,
        size: file.size,
        data: await file.arrayBuffer(),
      })),
    );
    setItems((prev) => [...prev, ...loaded]);
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const merge = async () => {
    setBusy(true);
    setError(null);
    try {
      const bytes = await mergePdfs(items);
      downloadBytes(bytes, 'merged.pdf', 'application/pdf');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '合并失败，请确认文件是未加密的 PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="📄"
      title="PDF 合并"
      description="把多个 PDF 按顺序合并成一个文件，可随时调整先后次序。"
    >
      <div className="space-y-4">
        <FileDrop
          accept="application/pdf"
          multiple
          onFiles={addFiles}
          hint="支持选择多个 PDF，处理在本地完成后自动下载"
        />

        {error && <p className="error-text">{error}</p>}

        {items.length > 0 && (
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="card flex items-center justify-between gap-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  {index + 1}. {item.name}
                  <span className="ml-2 text-neutral-400">{formatBytes(item.size)}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="上移"
                    className="btn-secondary px-2 py-1"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="下移"
                    className="btn-secondary px-2 py-1"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-2 py-1"
                    onClick={() => remove(index)}
                  >
                    移除
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={merge}
          disabled={busy || items.length < 2}
        >
          {busy ? '合并中…' : `合并 ${items.length} 个文件并下载`}
        </button>
      </div>
    </ToolShell>
  );
}
