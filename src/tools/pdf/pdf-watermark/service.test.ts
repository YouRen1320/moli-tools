import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { addImageWatermark, addTextWatermark, LATIN_ONLY_PATTERN } from './service';

async function createTwoPagePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([300, 400]);
  doc.addPage([300, 400]);
  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

// 1x1 红色像素 PNG
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('addTextWatermark', () => {
  it('拉丁文字水印不抛错且页数保留', async () => {
    const source = await createTwoPagePdf();
    const output = await addTextWatermark(source, 'CONFIDENTIAL', { fontSize: 40, opacity: 0.3 });
    const doc = await PDFDocument.load(output.buffer as ArrayBuffer);
    expect(doc.getPageCount()).toBe(2);
  });

  it('中文字符给出明确引导', async () => {
    const source = await createTwoPagePdf();
    await expect(
      addTextWatermark(source, '机密文件', { fontSize: 40, opacity: 0.3 }),
    ).rejects.toThrow('请改用图片水印');
  });

  it('空白文字报错', async () => {
    const source = await createTwoPagePdf();
    await expect(addTextWatermark(source, '  ', { fontSize: 40, opacity: 0.3 })).rejects.toThrow(
      '请输入水印文字',
    );
  });
});

describe('addImageWatermark', () => {
  it('平铺图片水印不抛错且页数保留', async () => {
    const source = await createTwoPagePdf();
    const pngBuffer = Uint8Array.from(atob(TINY_PNG_BASE64), (c) => c.charCodeAt(0));
    const output = await addImageWatermark(source, pngBuffer.buffer as ArrayBuffer, 'png', {
      opacity: 0.2,
      tileRatio: 0.3,
    });
    const doc = await PDFDocument.load(output.buffer as ArrayBuffer);
    expect(doc.getPageCount()).toBe(2);
  });
});

describe('LATIN_ONLY_PATTERN', () => {
  it('拉丁字符通过，CJK 拒绝', () => {
    expect(LATIN_ONLY_PATTERN.test('CONFIDENTIAL 2026')).toBe(true);
    expect(LATIN_ONLY_PATTERN.test('café')).toBe(true);
    expect(LATIN_ONLY_PATTERN.test('机密')).toBe(false);
  });
});
