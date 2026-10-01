import { lazy } from 'react';
import { defineTool } from '@tools/types';

export const tool = defineTool({
  slug: 'json-csv',
  category: 'convert',
  icon: '🔀',
  title: 'JSON ↔ CSV',
  description: 'JSON 数组与 CSV 双向转换，RFC 4180 规范转义，数字类型可选。',
  keywords: ['json', 'csv', '转换', '表格', 'rfc4180'],
  component: lazy(() => import('./index')),
});
