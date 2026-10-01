import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'unit-converter',
  category: 'convert',
  icon: '⚖️',
  title: '单位换算',
  description: '长度、重量、温度互转，支持中文习惯单位（里、丈、斤、两）。',
  keywords: ['unit', 'convert', '换算', '单位', '长度', '重量', '温度'],
  component: lazy(() => import('./index')),
});
