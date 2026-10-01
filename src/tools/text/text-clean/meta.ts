import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'text-clean',
  category: 'text',
  icon: '🧹',
  title: '文本清洗',
  description: '一键去重、排序、去空行、去首尾空格，批量整理文本。',
  keywords: ['text', 'clean', '去重', '排序', '清洗', '整理'],
  component: lazy(() => import('./index')),
});
