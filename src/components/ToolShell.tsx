import type { ReactNode } from 'react';

interface ToolShellProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolShell({ icon, title, description, children }: ToolShellProps) {
  return (
    <div>
      <header className="mb-6 flex items-start gap-3">
        <span aria-hidden className="text-3xl leading-none">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/55 px-2.5 py-0.5 text-xs text-neutral-600">
            <span aria-hidden>🌸</span> 本地处理 · 文件不上传
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}
