import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs, type PdfInput } from './service';

async function createPdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([300, 400]);
  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

async function countPages(data: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(data);
  return doc.getPageCount();
}

describe('mergePdfs', () => {
  it('按顺序合并多个 PDF 并保留页数', async () => {
    const inputs: PdfInput[] = [
      { name: 'a.pdf', data: await createPdf(1) },
      { name: 'b.pdf', data: await createPdf(3) },
    ];
    const merged = await mergePdfs(inputs);
    expect(await countPages(merged.buffer as ArrayBuffer)).toBe(4);
  });

  it('少于两个文件时给出可读错误', async () => {
    await expect(mergePdfs([{ name: 'a.pdf', data: await createPdf(1) }])).rejects.toThrow(
      '至少需要两个 PDF 文件',
    );
  });
});
