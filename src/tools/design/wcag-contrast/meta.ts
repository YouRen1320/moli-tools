import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'wcag-contrast',
  category: 'design',
  icon: '🔍',
  title: '对比度检查',
  description: '检查前景与背景色的 WCAG 对比度，标注 AA/AAA 达标情况。',
  keywords: ['wcag', 'contrast', 'a11y', '对比度', '无障碍'],
  component: lazy(() => import('./index')),
});
