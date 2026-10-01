/** canvas 编码的共享逻辑：图片压缩与 PDF 转图片共用 */

export type OutputFormat = 'webp' | 'jpeg' | 'png';

export interface CanvasEncodeOptions {
  mime: string;
  /** 0-1，仅对有损格式（webp/jpeg）生效 */
  quality?: number;
}

/** canvas → Blob；编码失败给出可读错误（jsdom 等无 canvas 环境不可用） */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: CanvasEncodeOptions,
): Promise<Blob> {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, options.mime, options.quality),
  ).then((blob) => {
    if (!blob) throw new Error('编码失败，请换一个格式或降低质量后重试');
    return blob;
  });
}

export function createCanvas(
  width: number,
  height: number,
): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('当前浏览器不支持 canvas 绘制');
  return { canvas, context };
}

/** 输出 MIME 类型；PNG 是无损格式，quality 不生效 */
export function resolveMime(format: OutputFormat): string {
  return `image/${format}`;
}
