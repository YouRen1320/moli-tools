import { describe, expect, it } from 'vitest';
import { decodeBase64, encodeBase64, looksLikeBase64 } from './service';

describe('encodeBase64 / decodeBase64', () => {
  it('往返一致', () => {
    const samples = ['hello', 'YouRen工具箱', 'emoji 🧰🎉', 'line\nbreak\ttab'];
    for (const sample of samples) {
      expect(decodeBase64(encodeBase64(sample))).toBe(sample);
    }
  });

  it('与已知标准向量一致', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
    expect(encodeBase64('世界')).toBe('5LiW55WM');
  });

  it('解码非法输入时抛错', () => {
    expect(() => decodeBase64('!!!不是 base64!!!')).toThrow();
  });
});

describe('looksLikeBase64', () => {
  it('识别合法形态', () => {
    expect(looksLikeBase64('aGVsbG8=')).toBe(true);
    expect(looksLikeBase64('5LiW55WM')).toBe(true);
  });

  it('拒绝非法形态', () => {
    expect(looksLikeBase64('')).toBe(false);
    expect(looksLikeBase64('abc')).toBe(false);
    expect(looksLikeBase64('你好世界')).toBe(false);
  });
});
