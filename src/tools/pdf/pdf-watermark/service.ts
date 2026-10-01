import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export type ImageType = 'png' | 'jpg';

export interface TextWatermarkOptions {
  fontSize: number;
  opacity: number;
}

export interface ImageWatermarkOptions {
  opacity: number;
  /** 水印图相对页面短边的尺寸占比（0.1-0.5） */
  tileRatio: number;
}

/** pdf-lib 内置字体只支持拉丁字符（WinAnsi），中文请用图片水印 */
export const LATIN_ONLY_PATTERN = /^[\u0020-\u007E\u00A0-\u00FF]*$/;

export async function addTextWatermark(
  source: ArrayBuffer,
  text: string,
  options: TextWatermarkOptions,
): Promise<Uint8Array> {
  const trimmed = text.trim();
  if (trimmed === '') throw new Error('请输入水印文字');
  if (!LATIN_ONLY_PATTERN.test(trimmed)) {
    throw new Error('文字水印暂不支持中文等非拉丁字符，请改用图片水印');
  }
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(trimmed, options.fontSize);
    page.drawText(trimmed, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - options.fontSize / 2,
      size: options.fontSize,
      font,
      color: rgb(0.55, 0.55, 0.6),
      opacity: options.opacity,
      rotate: degrees(45),
    });
  }
  return doc.save();
}

export async function addImageWatermark(
  source: ArrayBuffer,
  imageBytes: ArrayBuffer,
  imageType: ImageType,
  options: ImageWatermarkOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  const image =
    imageType === 'png' ? await doc.embedPng(imageBytes) : await doc.embedJpg(imageBytes);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const tileWidth = Math.min(width, height) * options.tileRatio;
    const tileHeight = tileWidth * (image.height / image.width);
    const stepX = tileWidth * 1.6;
    const stepY = tileHeight * 1.6;
    for (let x = -tileWidth; x < width; x += stepX) {
      for (let y = -tileHeight; y < height; y += stepY) {
        page.drawImage(image, {
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          opacity: options.opacity,
        });
      }
    }
  }
  return doc.save();
}
