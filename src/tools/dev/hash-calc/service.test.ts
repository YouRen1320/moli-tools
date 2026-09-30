// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hashText, HASH_ALGORITHMS } from './service';

// NIST 标准测试向量
describe('hashText', () => {
  it('SHA-256 已知向量', async () => {
    expect(await hashText('', 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(await hashText('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('SHA-1 已知向量', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('四种算法都返回正确长度的十六进制', async () => {
    const expectedLengths = { 'SHA-1': 40, 'SHA-256': 64, 'SHA-384': 96, 'SHA-512': 128 };
    for (const algorithm of HASH_ALGORITHMS) {
      const hex = await hashText('茉莉', algorithm);
      expect(hex).toMatch(/^[0-9a-f]+$/);
      expect(hex).toHaveLength(expectedLengths[algorithm]);
    }
  });
});
