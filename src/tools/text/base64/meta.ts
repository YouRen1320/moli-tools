import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'base64',
  category: 'text',
  icon: '🔐',
  title: 'Base64 编解码',
  description: '文本与 Base64 互转，UTF-8 安全，中文不乱码。',
  keywords: ['base64', 'encode', 'decode', '编码', '解码'],
  component: lazy(() => import('./index')),
});
