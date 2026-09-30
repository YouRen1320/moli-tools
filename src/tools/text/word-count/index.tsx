import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import { countTextStats, type TextStats } from './service';

const STAT_ITEMS: { key: keyof TextStats; label: string }[] = [
  { key: 'words', label: '词数' },
  { key: 'characters', label: '字符数' },
  { key: 'charactersNoSpaces', label: '不含空格' },
  { key: 'cjkCharacters', label: '中文字符' },
  { key: 'lines', label: '行数' },
  { key: 'sentences', label: '句子数' },
  { key: 'paragraphs', label: '段落数' },
];

export default function WordCount() {
  const [input, setInput] = useState('');
  const stats = countTextStats(input);

  return (
    <ToolShell
      icon="📝"
      title="字数统计"
      description="中英混排友好的字数/词数/行数/段落统计，中文按字计词。"
    >
      <div className="space-y-4">
        <label className="block text-sm text-neutral-600" htmlFor="word-count-input">
          输入文本（统计实时更新）
        </label>
        <textarea
          id="word-count-input"
          rows={8}
          className="text-input"
          value={input}
          placeholder="粘贴或输入任意文本…"
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="card p-3 text-center">
              <p className="text-xl font-bold text-dusk-violet">{stats[item.key]}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{item.label}</p>
            </div>
          ))}
        </div>

        {input !== '' && (
          <button type="button" className="btn-secondary" onClick={() => setInput('')}>
            清空
          </button>
        )}
      </div>
    </ToolShell>
  );
}
