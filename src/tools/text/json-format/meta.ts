import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'json-format',
  category: 'text',
  icon: '🧾',
  title: 'JSON 格式化',
  description: '格式化、压缩与校验 JSON，出错时提示具体位置。',
  keywords: ['json', 'format', '格式化', '压缩', '校验'],
  component: lazy(() => import('./index')),
});
