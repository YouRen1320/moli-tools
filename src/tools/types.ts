import type { ComponentType } from 'react';

export const toolCategories = {
  pdf: 'PDF 工具',
  image: '图片工具',
  text: '文本工具',
  time: '时间工具',
  generate: '生成工具',
  design: '设计工具',
} as const;

export type ToolCategory = keyof typeof toolCategories;

export interface ToolMeta {
  /** URL 路径标识，全站唯一，如 pdf-merge；访问路径为 /tools/<slug> */
  slug: string;
  category: ToolCategory;
  icon: string;
  title: string;
  description: string;
  keywords: string[];
  component: ComponentType;
}

export function defineTool(meta: ToolMeta): ToolMeta {
  return meta;
}
