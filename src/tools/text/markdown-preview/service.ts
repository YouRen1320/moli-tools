import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Markdown → 消毒后的 HTML。DOMPurify 依赖 DOM，仅在浏览器环境可用；
 * SSR 预渲染阶段返回空串，由组件挂载后重新计算 */
export function renderMarkdown(text: string): string {
  const rawHtml = marked.parse(text, { async: false });
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(rawHtml);
}
