import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'word-count',
  category: 'text',
  icon: '📝',
  title: '字数统计',
  description: '中英混排友好的字数/词数/行数/段落统计，中文按字计词。',
  keywords: ['word', 'count', '字数', '统计', '写作'],
  component: lazy(() => import('./index')),
});
