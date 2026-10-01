import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { cleanText, DEFAULT_OPTIONS, type CleanOptions } from './service';

type OptionKey = keyof CleanOptions;

const OPTION_LABELS: { key: OptionKey; label: string }[] = [
  { key: 'trimLines', label: '去首尾空格' },
  { key: 'removeEmptyLines', label: '去空行' },
  { key: 'dedupeLines', label: '去重' },
  { key: 'sortAsc', label: '升序排序' },
  { key: 'sortDesc', label: '降序排序' },
];

export default function TextClean() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_OPTIONS);

  const updateOption = (key: OptionKey, value: boolean) => {
    setOptions((prev) => {
      // 升序与降序互斥
      if (key === 'sortAsc' && value) return { ...prev, sortAsc: true, sortDesc: false };
      if (key === 'sortDesc' && value) return { ...prev, sortAsc: false, sortDesc: true };
      return { ...prev, [key]: value };
    });
  };

  const output = input === '' ? '' : cleanText(input, options);

  return (
    <ToolShell
      icon="🧹"
      title="文本清洗"
      description="一键去重、排序、去空行、去首尾空格，批量整理文本。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {OPTION_LABELS.map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={options[item.key]}
                onChange={(event) => updateOption(item.key, event.target.checked)}
                className="h-4 w-4 accent-dusk-violet"
              />
              {item.label}
            </label>
          ))}
        </div>

        <label className="block text-sm text-neutral-700" htmlFor="clean-input">
          原始文本
        </label>
        <textarea
          id="clean-input"
          rows={8}
          className="text-input"
          value={input}
          placeholder="每行一条，粘贴进来…"
          onChange={(event) => setInput(event.target.value)}
        />

        {output !== '' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-neutral-700" htmlFor="clean-output">
                清洗结果
              </label>
              <CopyButton value={output} />
            </div>
            <textarea id="clean-output" rows={8} className="text-input" readOnly value={output} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
