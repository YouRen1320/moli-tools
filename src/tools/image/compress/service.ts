export type OutputFormat = 'webp' | 'jpeg' | 'png';

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

/** 输出 MIME 类型；PNG 是无损格式，quality 不生效 */
export function resolveMime(format: OutputFormat): string {
  return `image/${format}`;
}

/** 单文件压缩：canvas 重编码。浏览器环境运行，逻辑拆薄方便测试 */
export async function compressImage(source: Blob, options: CompressOptions): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') throw new Error('当前环境不支持图片解码');
  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('当前浏览器不支持 canvas 绘制');
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, resolveMime(options.format), options.quality),
    );
    if (!blob) throw new Error('编码失败，请换一个格式或降低质量后重试');
    return blob;
  } finally {
    bitmap.close();
  }
}
