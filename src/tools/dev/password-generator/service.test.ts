import { describe, expect, it } from 'vitest';
import {
  clearHistory,
  entropyBits,
  generatePassword,
  HISTORY_KEY,
  loadHistory,
  saveToHistory,
  strengthLabel,
  LIMITS,
  type HistoryEntry,
} from './service';

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

describe('生成历史（localStorage）', () => {
  it('保存后可读取，且新密码排最前', () => {
    const a = generatePassword({ length: 16, uppercase: true, digits: true, symbols: true });
    const list = saveToHistory(a, { length: 16, uppercase: true, digits: true, symbols: true });
    expect(list[0].password).toBe(a);
    expect(loadHistory()[0].password).toBe(a);
  });

  it('相同密码去重并移到最前', () => {
    const options = { length: 16, uppercase: false, digits: false, symbols: false };
    const pw = generatePassword(options);
    saveToHistory(pw, options);
    const newer = generatePassword(options);
    saveToHistory(newer, options);
    const again = saveToHistory(pw, options);
    expect(again[0].password).toBe(pw);
    expect(again.filter((entry) => entry.password === pw)).toHaveLength(1);
  });

  it('历史上限 10 条', () => {
    const options = { length: LIMITS.maxLength, uppercase: false, digits: false, symbols: false };
    let list: HistoryEntry[] = [];
    for (let i = 0; i < 12; i += 1) {
      list = saveToHistory(generatePassword(options), options, list);
    }
    expect(list).toHaveLength(10);
  });

  it('清空后为空', () => {
    const options = { length: LIMITS.minLength, uppercase: false, digits: false, symbols: false };
    saveToHistory(generatePassword(options), options);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it('损坏的历史数据静默为空', () => {
    localStorage.setItem(HISTORY_KEY, '{bad json');
    expect(loadHistory()).toEqual([]);
    localStorage.setItem(HISTORY_KEY, '["不是历史对象"]');
    expect(loadHistory()).toEqual([]);
  });
});
