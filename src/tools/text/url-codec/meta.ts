import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'url-codec',
  category: 'text',
  icon: '🔗',
  title: 'URL 编解码',
  description: 'URL 组件与完整 URL 两种模式的百分号编码互转。',
  keywords: ['url', 'encode', 'decode', '编码', '解码', '百分号'],
  component: lazy(() => import('./index')),
});
