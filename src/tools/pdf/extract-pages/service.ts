import { PDFDocument } from 'pdf-lib';

export async function extractPages(
  source: ArrayBuffer,
  pagesOneBased: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(source, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const indices = pagesOneBased.map((n) => n - 1);
  const copied = await out.copyPages(src, indices);
  copied.forEach((page) => out.addPage(page));
  return out.save();
}
