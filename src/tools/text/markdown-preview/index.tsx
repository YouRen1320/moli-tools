import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { renderMarkdown } from './service';

const SAMPLE =
  '# 你好\n\n在左边写 **Markdown**，右边即时预览。\n\n- 支持 [链接](https://example.com)\n- 代码块与表格\n';

export default function MarkdownPreview() {
  const [text, setText] = useState(SAMPLE);
  // 懒初始化：浏览器首帧即计算；SSR 阶段无 window，返回空串
  const [html, setHtml] = useState(() => renderMarkdown(SAMPLE));

  const handleTextChange = (value: string) => {
    setText(value);
    setHtml(renderMarkdown(value));
  };

  return (
    <ToolShell
      icon="📋"
      title="Markdown 预览"
      description="左侧书写右侧实时预览，输出经过 XSS 消毒的干净 HTML。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm text-neutral-700" htmlFor="markdown-input">
            Markdown
          </label>
          <textarea
            id="markdown-input"
            rows={16}
            className="text-input"
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">预览</span>
            <CopyButton value={html} label="复制 HTML" />
          </div>
          <div
            className="h-full min-h-72 overflow-auto rounded-xl border border-white/60 bg-white/70 p-4 text-sm leading-relaxed [&_a]:text-dusk-violet [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-white/70 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-neutral-100 [&_table]:w-full [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_th]:border [&_th]:border-neutral-300 [&_th]:px-2"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolShell>
  );
}
