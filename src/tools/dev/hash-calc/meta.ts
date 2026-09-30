import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'hash-calc',
  category: 'dev',
  icon: '🔑',
  title: '哈希计算',
  description: '计算文本或文件的 SHA-1/256/384/512 摘要，基于浏览器原生 WebCrypto。',
  keywords: ['hash', 'sha256', 'checksum', '哈希', '摘要', '校验'],
  component: lazy(() => import('./index')),
});
