import { describe, expect, it } from 'vitest';
import { countTextStats } from './service';

describe('countTextStats', () => {
  it('统计中英混排文本', () => {
    const stats = countTextStats('Hello 世界\n\nSecond 段落.');
    expect(stats.characters).toBe(20);
    expect(stats.cjkCharacters).toBe(4);
    expect(stats.words).toBe(6);
    expect(stats.lines).toBe(3);
    expect(stats.sentences).toBe(1);
    expect(stats.paragraphs).toBe(2);
  });

  it('空文本全为 0', () => {
    const stats = countTextStats('   ');
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(3);
    expect(stats.charactersNoSpaces).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });
});
