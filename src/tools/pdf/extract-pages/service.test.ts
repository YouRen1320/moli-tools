import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { extractPages } from './service';
import { parsePageRanges } from '@lib/pageRange';

async function createPdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([300, 400]);
  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

describe('extractPages', () => {
  it('按 1 起始页码提取指定页面', async () => {
    const source = await createPdf(5);
    const result = await extractPages(source, [5, 1, 3]);
    const doc = await PDFDocument.load(result.buffer as ArrayBuffer);
    expect(doc.getPageCount()).toBe(3);
  });
});

describe('parsePageRanges', () => {
  it.each([
    ['1,3-5', 10, [1, 3, 4, 5]],
    ['2', 10, [2]],
    ['8-10,2', 10, [2, 8, 9, 10]],
  ])('解析 %s', (input, pageCount, expected) => {
    expect(parsePageRanges(input, pageCount)).toEqual(expected);
  });

  it('拒绝越界页码', () => {
    expect(() => parsePageRanges('11', 10)).toThrow('超出范围');
  });

  it('拒绝颠倒的范围', () => {
    expect(() => parsePageRanges('5-3', 10)).toThrow('颠倒');
  });

  it('拒绝空输入', () => {
    expect(() => parsePageRanges('  ', 10)).toThrow('请输入页码');
  });
});
