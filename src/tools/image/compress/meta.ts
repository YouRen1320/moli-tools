import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'image-compress',
  category: 'image',
  icon: '🖼️',
  title: '图片压缩',
  description: '在浏览器里把图片重新编码为 WebP/JPEG/PNG，调节质量控制体积。',
  keywords: ['image', 'compress', 'webp', '压缩', '图片', '转换'],
  component: lazy(() => import('./index')),
});
