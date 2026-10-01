import { canvasToBlob, createCanvas, resolveMime, type OutputFormat } from '@lib/canvas';

export interface CompressOptions {
  format: OutputFormat;
  /** 0-1，仅对有损格式（webp/jpeg）生效 */
  quality: number;
}

export function resolveOutputName(sourceName: string, format: OutputFormat): string {
  const baseName = sourceName.replace(/\.[^.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `${baseName}-compressed.${ext}`;
}

export { resolveMime };

/** 单文件压缩：canvas 重编码。浏览器环境运行，逻辑拆薄方便测试 */
export async function compressImage(source: Blob, options: CompressOptions): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') throw new Error('当前环境不支持图片解码');
  const bitmap = await createImageBitmap(source);
  try {
    const { canvas, context } = createCanvas(bitmap.width, bitmap.height);
    context.drawImage(bitmap, 0, 0);
    return await canvasToBlob(canvas, {
      mime: resolveMime(options.format),
      quality: options.quality,
    });
  } finally {
    bitmap.close();
  }
}
