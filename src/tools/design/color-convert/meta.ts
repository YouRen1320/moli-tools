import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'color-convert',
  category: 'design',
  icon: '🎨',
  title: '颜色转换',
  description: 'HEX / RGB / HSL 互转，实时预览，支持三种格式直接输入。',
  keywords: ['color', 'hex', 'rgb', 'hsl', '颜色', '调色'],
  component: lazy(() => import('./index')),
});
