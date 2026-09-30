import { describe, expect, it } from 'vitest';
import { bundleImages, type RenderedImage } from './service';
import { parsePageRanges } from '@lib/pageRange';

describe('bundleImages', () => {
  const make = (name: string): RenderedImage => ({ name, bytes: new Uint8Array([1, 2, 3]) });

  it('单张图片直接返回', async () => {
    const result = await bundleImages([make('page-1.png')]);
    expect(result.name).toBe('page-1.png');
  });

  it('多张图片打包为 zip', async () => {
    const result = await bundleImages([make('page-1.png'), make('page-2.png')]);
    expect(result.name).toBe('pdf-pages-2.zip');
    expect(result.bytes[0]).toBe(0x50); // 'P' of PK zip header
    expect(result.bytes[1]).toBe(0x4b); // 'K'
  });

  it('空列表报错', async () => {
    await expect(bundleImages([])).rejects.toThrow('没有可下载的图片');
  });
});

describe('页码解析与 PDF 转图片协作', () => {
  it('页码表达式可复用统一解析器', () => {
    expect(parsePageRanges('1-3', 8)).toEqual([1, 2, 3]);
  });
});
