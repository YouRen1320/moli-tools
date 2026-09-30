import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { bundleImages, type RenderedImage } from './service';
import { parsePageRanges } from '@lib/pageRange';
import { downloadBytes } from '@lib/download';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Source {
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

const SCALES = [1, 1.5, 2, 3];

async function renderPages(
  source: Source,
  pages: number[],
  scale: number,
): Promise<RenderedImage[]> {
  const doc = await pdfjsLib.getDocument({ data: source.data }).promise;
  const images: RenderedImage[] = [];
  for (const pageNumber of pages) {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器不支持 canvas 绘制');
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('页面编码失败，请重试');
    const baseName = source.name.replace(/\.pdf$/i, '');
    images.push({
      name: `${baseName}-p${pageNumber}.png`,
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  return images;
}

export default function PdfToImage() {
  const [source, setSource] = useState<Source | null>(null);
  const [pagesInput, setPagesInput] = useState('');
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = async (files: File[]) => {
    const file = files[0];
    setError(null);
    try {
      const data = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data }).promise;
      setSource({ name: file.name, data, pageCount: doc.numPages });
      setPagesInput('');
    } catch {
      setError('读取失败，请确认这是一个未加密的 PDF 文件');
    }
  };

  const convert = async () => {
    if (!source) return;
    setBusy(true);
    setError(null);
    try {
      const pages = parsePageRanges(pagesInput, source.pageCount);
      const images = await renderPages(source, pages, scale);
      const bundle = await bundleImages(images);
      downloadBytes(bundle.bytes, bundle.name, 'application/octet-stream');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '转换失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="🏞️"
      title="PDF 转图片"
      description="按页码把 PDF 页面渲染为 PNG，多页自动打包成 zip 下载。"
    >
      <div className="space-y-4">
        {!source ? (
          <FileDrop
            accept="application/pdf"
            onFiles={loadFile}
            hint="选择一个 PDF，渲染全程在本地完成"
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
          <>
            <label className="block text-sm text-neutral-600" htmlFor="pdf-image-pages">
              页码（1 起始，支持逗号与连字符，例如 1,3-5）
            </label>
            <input
              id="pdf-image-pages"
              type="text"
              className="text-input"
              placeholder={`1-${Math.min(source.pageCount, 3)}`}
              value={pagesInput}
              onChange={(event) => setPagesInput(event.target.value)}
            />
            <label className="block text-sm text-neutral-600" htmlFor="pdf-image-scale">
              清晰度（{scale}x，越大越清晰、文件越大）
              <select
                id="pdf-image-scale"
                className="mt-1 block rounded-lg border border-neutral-300 bg-white/70 px-2 py-1.5 text-sm"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
              >
                {SCALES.map((item) => (
                  <option key={item} value={item}>
                    {item}x
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn-primary" onClick={convert} disabled={busy}>
              {busy ? '渲染中…' : '转换为 PNG 并下载'}
            </button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </ToolShell>
  );
}
