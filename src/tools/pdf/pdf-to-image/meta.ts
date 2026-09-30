import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'pdf-to-image',
  category: 'pdf',
  icon: '🏞️',
  title: 'PDF 转图片',
  description: '按页码把 PDF 页面渲染为 PNG，多页自动打包成 zip 下载。',
  keywords: ['pdf', 'image', 'png', '转图片', '导出'],
  component: lazy(() => import('./index')),
});
