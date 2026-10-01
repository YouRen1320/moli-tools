import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'pdf-watermark',
  category: 'pdf',
  icon: '💧',
  title: 'PDF 水印',
  description: '给 PDF 每页加平铺图片水印或斜向文字水印，全程本地处理。',
  keywords: ['pdf', 'watermark', '水印', '盖章'],
  component: lazy(() => import('./index')),
});
