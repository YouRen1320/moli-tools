import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import { diffTexts, type DiffRow } from './service';

const ROW_STYLE: Record<DiffRow['type'], string> = {
  added: 'bg-emerald-100/80 text-emerald-900',
  removed: 'bg-rose-100/80 text-rose-900 line-through decoration-rose-400',
  common: 'text-neutral-700',
};

const ROW_PREFIX: Record<DiffRow['type'], string> = {
  added: '+ ',
  removed: '- ',
  common: '  ',
};

export default function TextDiff() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [result, setResult] = useState<ReturnType<typeof diffTexts> | null>(null);

  const compare = () => setResult(diffTexts(oldText, newText));

  return (
    <ToolShell icon="🆚" title="文本对比" description="逐行对比两段文本，标出新增与删除的行。">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm text-neutral-700" htmlFor="diff-old">
              原文本
            </label>
            <textarea
              id="diff-old"
              rows={8}
              className="text-input"
              value={oldText}
              placeholder="原来的内容…"
              onChange={(event) => setOldText(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-neutral-700" htmlFor="diff-new">
              新文本
            </label>
            <textarea
              id="diff-new"
              rows={8}
              className="text-input"
              value={newText}
              placeholder="修改后的内容…"
              onChange={(event) => setNewText(event.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={compare}
          disabled={oldText === '' && newText === ''}
        >
          对比
        </button>

        {result && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              新增 <strong className="text-emerald-700">{result.addedLines}</strong> 行 · 删除{' '}
              <strong className="text-rose-700">{result.removedLines}</strong> 行
            </p>
            <div className="max-h-96 overflow-auto rounded-xl border border-white/60 bg-white/70 p-3 font-mono text-xs leading-relaxed">
              {result.rows.map((row, index) => (
                <div key={index} className={`whitespace-pre-wrap px-1 ${ROW_STYLE[row.type]}`}>
                  {ROW_PREFIX[row.type]}
                  {row.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
