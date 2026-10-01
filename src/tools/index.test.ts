import { describe, expect, it } from 'vitest';
import { allTools, getTool, getToolsByCategory, toolCategories } from './index';

describe('工具注册表', () => {
  it('注册了 14 个工具', () => {
    expect(allTools).toHaveLength(14);
  });

  it('slug 全局唯一且格式合法', () => {
    const slugs = allTools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z\d]+(-[a-z\d]+)*$/);
    }
  });

  it('每个工具的元数据完整', () => {
    for (const tool of allTools) {
      expect(tool.title.trim(), `${tool.slug} 缺少标题`).not.toBe('');
      expect(tool.description.trim(), `${tool.slug} 缺少描述`).not.toBe('');
      expect(tool.keywords.length, `${tool.slug} 缺少关键词`).toBeGreaterThan(0);
      expect(tool.component, `${tool.slug} 缺少组件`).toBeTruthy();
      expect(toolCategories[tool.category], `${tool.slug} 分类非法`).toBeTruthy();
    }
  });

  it('getTool / getToolsByCategory 查询正确', () => {
    expect(getTool('pdf-merge')?.title).toBe('PDF 合并');
    expect(getTool('no-such-tool')).toBeUndefined();
    expect(getToolsByCategory('pdf').map((tool) => tool.slug)).toEqual([
      'pdf-merge',
      'pdf-extract-pages',
      'pdf-to-image',
    ]);
    expect(getToolsByCategory('dev').map((tool) => tool.slug)).toEqual([
      'hash-calc',
      'password-generator',
      'uuid-generator',
    ]);
  });
});
