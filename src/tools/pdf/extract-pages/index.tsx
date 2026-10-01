import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { extractPages } from './service';
import { parsePageRanges } from '@lib/pageRange';
import { downloadBytes } from '@lib/download';

interface Source {
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export default function ExtractPages() {
  const [source, setSource] = useState<Source | null>(null);
  const [pagesInput, setPagesInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (files: File[]) => {
    const file = files[0];
    setError(null);
    try {
      const data = await file.arrayBuffer();
      const doc = await PDFDocument.load(data, { ignoreEncryption: true });
      setSource({ name: file.name, data, pageCount: doc.getPageCount() });
      setPagesInput('');
    } catch {
      setError('读取失败，请确认这是一个未加密的 PDF 文件');
    }
  };

  const extract = async () => {
    if (!source) return;
    setBusy(true);
    setError(null);
    try {
      const pages = parsePageRanges(pagesInput, source.pageCount);
      const bytes = await extractPages(source.data, pages);
      const baseName = source.name.replace(/\.pdf$/i, '');
      downloadBytes(bytes, `${baseName}-extracted.pdf`, 'application/pdf');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '提取失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="📑"
      title="PDF 提取页面"
      description="输入页码（支持 1,3-5 这类写法），把选中的页面导出为一个新的 PDF。"
    >
      <div className="space-y-4">
        {!source ? (
          <FileDrop
            accept="application/pdf"
            onFiles={loadFile}
            hint="选择一个 PDF，处理全程在本地完成"
          />
        ) : (
          <div className="card flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm">
              {source.name}
              <span className="ml-2 text-neutral-400">共 {source.pageCount} 页</span>
            </span>
            <button type="button" className="btn-secondary" onClick={() => setSource(null)}>
              重新选择
            </button>
          </div>
        )}

        {source && (
          <div className="space-y-2">
            <label className="block text-sm text-neutral-700" htmlFor="pages-input">
              页码（1 起始，支持逗号与连字符，例如 1,3-5）
            </label>
            <input
              id="pages-input"
              type="text"
              className="text-input"
              placeholder={`1-${Math.min(source.pageCount, 3)}`}
              value={pagesInput}
              onChange={(event) => setPagesInput(event.target.value)}
            />
            <button type="button" className="btn-primary" onClick={extract} disabled={busy}>
              {busy ? '提取中…' : '提取并下载'}
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </ToolShell>
  );
}
