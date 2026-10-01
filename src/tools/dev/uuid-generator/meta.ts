import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'uuid-generator',
  category: 'dev',
  icon: '🆔',
  title: 'UUID 生成器',
  description: '批量生成 v4 随机 UUID，基于浏览器加密级随机数。',
  keywords: ['uuid', 'guid', 'uuidv4', '生成', '标识'],
  component: lazy(() => import('./index')),
});
