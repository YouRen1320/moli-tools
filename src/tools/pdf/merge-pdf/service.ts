import { PDFDocument } from 'pdf-lib';

export interface PdfInput {
  name: string;
  data: ArrayBuffer;
}

export async function mergePdfs(inputs: PdfInput[]): Promise<Uint8Array> {
  if (inputs.length < 2) throw new Error('至少需要两个 PDF 文件');
  const merged = await PDFDocument.create();
  for (const input of inputs) {
    const doc = await PDFDocument.load(input.data, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}
