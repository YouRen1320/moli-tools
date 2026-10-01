import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'password-generator',
  category: 'dev',
  icon: '🛡️',
  title: '密码生成器',
  description: '用浏览器加密级随机数生成强密码，长度与字符集可调，附强度评估。',
  keywords: ['password', 'random', '密码', '生成', '安全'],
  component: lazy(() => import('./index')),
});
