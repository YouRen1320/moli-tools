import { describe, expect, it } from 'vitest';
import { compressImage, resolveMime, resolveOutputName, type OutputFormat } from './service';
import { savedPercent } from '@lib/format';

describe('resolveOutputName', () => {
  it.each([
    ['photo.png', 'webp', 'photo-compressed.webp'],
    ['风景.JPG', 'jpeg', '风景-compressed.jpg'],
    ['a.b.c.gif', 'png', 'a.b.c-compressed.png'],
  ])('%s + %s → %s', (source, format, expected) => {
    expect(resolveOutputName(source, format as OutputFormat)).toBe(expected);
  });
});

describe('resolveMime', () => {
  it('返回标准 MIME', () => {
    expect(resolveMime('jpeg')).toBe('image/jpeg');
    expect(resolveMime('webp')).toBe('image/webp');
  });
});

describe('savedPercent（lib/format）', () => {
  it('计算节省比例', () => {
    expect(savedPercent(1000, 400)).toBe(60);
    expect(savedPercent(1000, 2000)).toBe(0);
    expect(savedPercent(0, 10)).toBe(0);
  });
});

describe('compressImage', () => {
  it('在无图片解码能力的环境给出可读错误', async () => {
    await expect(
      compressImage(new Blob(['x'], { type: 'image/png' }), { format: 'webp', quality: 0.8 }),
    ).rejects.toThrow('当前环境不支持图片解码');
  });
});
