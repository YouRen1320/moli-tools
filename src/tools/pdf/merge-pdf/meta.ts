import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'pdf-merge',
  category: 'pdf',
  icon: '📄',
  title: 'PDF 合并',
  description: '把多个 PDF 按顺序合并成一个文件，可随时调整先后次序。',
  keywords: ['pdf', 'merge', '合并', '拼接'],
  component: lazy(() => import('./index')),
});
