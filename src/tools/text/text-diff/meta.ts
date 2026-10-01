import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'text-diff',
  category: 'text',
  icon: '🆚',
  title: '文本对比',
  description: '逐行对比两段文本，标出新增与删除的行。',
  keywords: ['diff', 'compare', '对比', '差异'],
  component: lazy(() => import('./index')),
});
