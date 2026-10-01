import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'markdown-preview',
  category: 'text',
  icon: '📋',
  title: 'Markdown 预览',
  description: '左侧书写右侧实时预览，输出经过 XSS 消毒的干净 HTML。',
  keywords: ['markdown', 'md', 'preview', '预览', 'html'],
  component: lazy(() => import('./index')),
});
