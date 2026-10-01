import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import FileDrop from '@components/FileDrop';
import { addImageWatermark, addTextWatermark, type ImageType } from './service';
import { downloadBytes } from '@lib/download';

type Mode = 'image' | 'text';

export default function PdfWatermark() {
  const [source, setSource] = useState<{ name: string; data: ArrayBuffer } | null>(null);
  const [mode, setMode] = useState<Mode>('image');
  const [watermarkImage, setWatermarkImage] = useState<{ file: File; type: ImageType } | null>(
    null,
  );
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [tileRatio, setTileRatio] = useState(0.3);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPdf = async (files: File[]) => {
    const file = files[0];
    setError(null);
    setSource({ name: file.name, data: await file.arrayBuffer() });
  };

  const loadWatermarkImage = (files: File[]) => {
    const file = files[0];
    const type: ImageType = file.type === 'image/jpeg' ? 'jpg' : 'png';
    setWatermarkImage({ file, type });
  };

  const apply = async () => {
    if (!source) return;
    setBusy(true);
    setError(null);
    try {
      let bytes: Uint8Array;
      if (mode === 'text') {
        bytes = await addTextWatermark(source.data, watermarkText, { fontSize, opacity });
      } else {
        if (!watermarkImage) {
          setError('请先选择一张水印图片（PNG/JPG）');
          setBusy(false);
          return;
        }
        bytes = await addImageWatermark(
          source.data,
          await watermarkImage.file.arrayBuffer(),
          watermarkImage.type,
          { opacity, tileRatio },
        );
      }
      const baseName = source.name.replace(/\.pdf$/i, '');
      downloadBytes(bytes, `${baseName}-watermarked.pdf`, 'application/pdf');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '加水印失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      icon="💧"
      title="PDF 水印"
      description="给 PDF 每页加平铺图片水印或斜向文字水印，全程本地处理。"
    >
      <div className="space-y-4">
        {!source ? (
          <FileDrop
            accept="application/pdf"
            onFiles={loadPdf}
            hint="选择一个 PDF，处理全程在本地完成"
          />
        ) : (
          <div className="card flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 truncate text-sm">{source.name}</span>
            <button type="button" className="btn-secondary" onClick={() => setSource(null)}>
              重新选择
            </button>
          </div>
        )}

        {source && (
          <>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'image', label: '🖼️ 图片水印（推荐，支持中文）' },
                  { value: 'text', label: '🔤 文字水印（仅英文/数字）' },
                ] as { value: Mode; label: string }[]
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    mode === item.value
                      ? 'bg-gradient-to-r from-dusk-coral to-dusk-violet text-white'
                      : 'border border-white/60 bg-white/60 text-neutral-700 hover:bg-white/85'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {mode === 'image' ? (
              <div className="space-y-3">
                {watermarkImage ? (
                  <div className="card flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {watermarkImage.file.name}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary shrink-0"
                      onClick={() => setWatermarkImage(null)}
                    >
                      重新选择
                    </button>
                  </div>
                ) : (
                  <FileDrop
                    accept="image/png,image/jpeg"
                    onFiles={loadWatermarkImage}
                    hint="PNG/JPG 均可，将平铺到每一页"
                  />
                )}
                <label className="block text-sm text-neutral-600" htmlFor="wm-tile">
                  水印大小：{Math.round(tileRatio * 100)}%（相对页面短边）
                  <input
                    id="wm-tile"
                    type="range"
                    min={0.1}
                    max={0.5}
                    step={0.05}
                    className="mt-1 w-full accent-dusk-violet"
                    value={tileRatio}
                    onChange={(event) => setTileRatio(Number(event.target.value))}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm text-neutral-600" htmlFor="wm-text">
                  水印文字（英文/数字，如 CONFIDENTIAL）
                </label>
                <input
                  id="wm-text"
                  type="text"
                  className="text-input"
                  value={watermarkText}
                  onChange={(event) => setWatermarkText(event.target.value)}
                />
                <label className="block text-sm text-neutral-600" htmlFor="wm-font">
                  字号：{fontSize}
                  <input
                    id="wm-font"
                    type="range"
                    min={24}
                    max={96}
                    step={8}
                    className="mt-1 w-full accent-dusk-violet"
                    value={fontSize}
                    onChange={(event) => setFontSize(Number(event.target.value))}
                  />
                </label>
              </div>
            )}

            <label className="block text-sm text-neutral-600" htmlFor="wm-opacity">
              透明度：{Math.round(opacity * 100)}%
              <input
                id="wm-opacity"
                type="range"
                min={0.05}
                max={0.6}
                step={0.05}
                className="mt-1 w-full accent-dusk-violet"
                value={opacity}
                onChange={(event) => setOpacity(Number(event.target.value))}
              />
            </label>

            <button type="button" className="btn-primary" onClick={apply} disabled={busy}>
              {busy ? '处理中…' : '加水印并下载'}
            </button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </ToolShell>
  );
}
