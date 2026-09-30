import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'timestamp',
  category: 'time',
  icon: '⏱️',
  title: '时间戳转换',
  description: 'Unix 时间戳与日期时间互转，支持秒/毫秒，一键取当前时间。',
  keywords: ['timestamp', 'unix', 'date', '时间戳', '日期'],
  component: lazy(() => import('./index')),
});
