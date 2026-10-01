import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { bundleImages, resolveImageName, type PageImageFormat } from './service';
import { canvasToBlob, createCanvas } from '@lib/canvas';
import { parsePageRanges } from '@lib/pageRange';
import { downloadBytes } from '@lib/download';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface Source {
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

const SCALES = [1, 1.5, 2, 3];

const FORMATS: { value: PageImageFormat; label: string }[] = [
  { value: 'png', label: 'PNG（无损）' },
  { value: 'jpeg', label: 'JPG（体积小）' },
];

const MIME_BY_FORMAT: Record<PageImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
};

async function renderPages(
  source: Source,
  pages: number[],
  scale: number,
  format: PageImageFormat,
  quality: number,
): Promise<RenderedImage[]> {
  const doc = await pdfjsLib.getDocument({ data: source.data }).promise;
  const baseName = source.name.replace(/\.pdf$/i, '');
  const images: RenderedImage[] = [];
  for (const pageNumber of pages) {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const { canvas, context } = createCanvas(
      Math.floor(viewport.width),
      Math.floor(viewport.height),
    );
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const blob = await canvasToBlob(canvas, { mime: MIME_BY_FORMAT[format], quality });
    images.push({
      name: resolveImageName(baseName, pageNumber, format),
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  return images;
}

export default function PdfToImage() {
  const [source, setSource] = useState<Source | null>(null);
  const [pagesInput, setPagesInput] = useState('');
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<PageImageFormat>('png');
  const [quality, setQuality] = useState(0.85);
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
      const images = await renderPages(source, pages, scale, format, quality);
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
      description="按页码把 PDF 页面渲染为图片，多页自动打包成 zip 下载。"
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

        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-neutral-700" htmlFor="pdf-image-format">
            输出格式
            <select
              id="pdf-image-format"
              className="mt-1 block rounded-lg border border-neutral-300 bg-white/70 px-2 py-1.5 text-sm"
              value={format}
              onChange={(event) => setFormat(event.target.value as PageImageFormat)}
            >
              {FORMATS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-40 flex-1 text-sm text-neutral-700" htmlFor="pdf-image-scale">
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
          {format === 'jpeg' && (
            <label className="min-w-40 flex-1 text-sm text-neutral-700" htmlFor="pdf-image-quality">
              JPG 质量：{Math.round(quality * 100)}%
              <input
                id="pdf-image-quality"
                type="range"
                min={0.4}
                max={0.95}
                step={0.05}
                className="mt-1 w-full accent-dusk-violet"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
            </label>
          )}
        </div>

        {source && (
          <>
            <label className="block text-sm text-neutral-700" htmlFor="pdf-image-pages">
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
            <button type="button" className="btn-primary" onClick={convert} disabled={busy}>
              {busy ? '渲染中…' : `转换为 ${format.toUpperCase()} 并下载`}
            </button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </ToolShell>
  );
}
