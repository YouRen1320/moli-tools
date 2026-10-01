import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './service';

describe('renderMarkdown', () => {
  it('转换标题与强调', () => {
    const html = renderMarkdown('# 标题\n\n**加粗**');
    expect(html).toContain('<h1>标题</h1>');
    expect(html).toContain('<strong>加粗</strong>');
  });

  it('移除 script 标签（XSS 消毒）', () => {
    const html = renderMarkdown('正文<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('正文');
  });

  it('移除 javascript: 链接', () => {
    const html = renderMarkdown('[点我](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('<a');
  });

  it('正常链接保留', () => {
    const html = renderMarkdown('[官网](https://example.com)');
    expect(html).toContain('href="https://example.com"');
  });
});
