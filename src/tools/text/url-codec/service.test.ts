import { describe, expect, it } from 'vitest';
import { decodeUrlText, encodeUrlText } from './service';

describe('encodeUrlText / decodeUrlText', () => {
  it('component 模式编码所有保留字符', () => {
    expect(encodeUrlText('a b&c=1', 'component')).toBe('a%20b%26c%3D1');
  });

  it('full 模式保留 URL 结构符', () => {
    const encoded = encodeUrlText('https://a.com/p?q=白', 'full');
    expect(encoded.startsWith('https://a.com/p?q=')).toBe(true);
    expect(encoded).toContain('%');
    expect(encoded).not.toContain('白');
  });

  it('两种模式往返一致', () => {
    for (const mode of ['component', 'full'] as const) {
      const sample = 'https://example.com/搜索?q=茉莉 词&x=1#frag';
      expect(decodeUrlText(encodeUrlText(sample, mode), mode)).toBe(sample);
    }
  });

  it('解码非法输入给出可读错误', () => {
    expect(() => decodeUrlText('%', 'component')).toThrow('解码失败');
  });
});
