import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'pdf-extract-pages',
  category: 'pdf',
  icon: '📑',
  title: 'PDF 提取页面',
  description: '输入页码（支持 1,3-5 这类写法），把选中的页面导出为一个新的 PDF。',
  keywords: ['pdf', 'extract', 'pages', '提取', '拆分', '页码'],
  component: lazy(() => import('./index')),
});
