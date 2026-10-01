import { describe, expect, it } from 'vitest';
import { entropyBits, generatePassword, strengthLabel, LIMITS } from './service';

describe('generatePassword', () => {
  it('长度符合设置且只含启用的字符集', () => {
    for (let round = 0; round < 20; round += 1) {
      const password = generatePassword({
        length: 16,
        uppercase: true,
        digits: true,
        symbols: true,
      });
      expect(password).toHaveLength(16);
      expect(password).toMatch(/^[A-Za-z0-9!@#$%^&*()\-_=+[\]{};:,.?/]+$/);
    }
  });

  it('关闭全部可选项时只含小写字母', () => {
    const password = generatePassword({
      length: LIMITS.minLength,
      uppercase: false,
      digits: false,
      symbols: false,
    });
    expect(password).toMatch(/^[a-z]+$/);
  });

  it('启用字符集保证至少出现一个', () => {
    for (let round = 0; round < 10; round += 1) {
      const password = generatePassword({
        length: 12,
        uppercase: true,
        digits: true,
        symbols: false,
      });
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
    }
  });

  it('拒绝越界长度', () => {
    expect(() =>
      generatePassword({ length: 4, uppercase: false, digits: false, symbols: false }),
    ).toThrow('8-64');
    expect(() =>
      generatePassword({ length: 100, uppercase: false, digits: false, symbols: false }),
    ).toThrow('8-64');
  });

  it('两次生成结果不同（随机性）', () => {
    const a = generatePassword({ length: 32, uppercase: true, digits: true, symbols: true });
    const b = generatePassword({ length: 32, uppercase: true, digits: true, symbols: true });
    expect(a).not.toBe(b);
  });
});

describe('entropyBits / strengthLabel', () => {
  it('按字符集与长度计算信息熵', () => {
    // 26 个小写字母，16 位：16 * log2(26) ≈ 75
    expect(entropyBits({ length: 16, uppercase: false, digits: false, symbols: false })).toBe(75);
    // 全字符集 26+26+10+24 = 86 个字符，8 位：8 * log2(86) ≈ 51
    expect(entropyBits({ length: 8, uppercase: true, digits: true, symbols: true })).toBe(51);
  });

  it('强度分级', () => {
    expect(strengthLabel(30).label).toBe('较弱');
    expect(strengthLabel(52).label).toBe('一般');
    expect(strengthLabel(70).label).toBe('良好');
    expect(strengthLabel(120).label).toBe('很强');
  });
});
