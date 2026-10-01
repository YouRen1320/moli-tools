import JSZip from 'jszip';

export type PageImageFormat = 'png' | 'jpeg';

export interface RenderedImage {
  name: string;
  bytes: Uint8Array;
}

export function resolveImageName(
  baseName: string,
  pageNumber: number,
  format: PageImageFormat,
): string {
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  return `${baseName}-p${pageNumber}.${ext}`;
}

/** 多张图片打包为 zip；单张时原样返回，方便直接下载 */
export async function bundleImages(
  images: RenderedImage[],
): Promise<{ bytes: Uint8Array; name: string }> {
  if (images.length === 0) throw new Error('没有可下载的图片');
  if (images.length === 1) {
    return { bytes: images[0].bytes, name: images[0].name };
  }
  const zip = new JSZip();
  for (const image of images) {
    zip.file(image.name, image.bytes);
  }
  return {
    bytes: await zip.generateAsync({ type: 'uint8array' }),
    name: `pdf-pages-${images.length}.zip`,
  };
}
