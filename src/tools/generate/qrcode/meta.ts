import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'qrcode',
  category: 'generate',
  icon: '🧿',
  title: '二维码生成',
  description: '把链接或文本生成二维码 PNG，可调尺寸与容错等级。',
  keywords: ['qrcode', 'qr', '二维码', '生成'],
  component: lazy(() => import('./index')),
});
