import { useState } from 'react';
import ToolShell from '@components/ToolShell';
import CopyButton from '@components/CopyButton';
import { generateUuids, MAX_COUNT } from './service';

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    setError(null);
    try {
      setUuids(generateUuids(count));
    } catch (cause) {
      setUuids([]);
      setError(cause instanceof Error ? cause.message : '生成失败');
    }
  };

  return (
    <ToolShell
      icon="🆔"
      title="UUID 生成器"
      description="批量生成 v4 随机 UUID，基于浏览器加密级随机数。"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-neutral-700" htmlFor="uuid-count">
            数量（1-{MAX_COUNT}）
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={MAX_COUNT}
              className="text-input mt-1 w-24 font-sans"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
          <button type="button" className="btn-primary" onClick={generate}>
            生成
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {uuids.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">生成结果</p>
              <CopyButton value={uuids.join('\n')} label="复制全部" />
            </div>
            <ol className="space-y-2">
              {uuids.map((uuid, index) => (
                <li key={uuid} className="card flex items-center justify-between gap-3 py-2">
                  <code className="min-w-0 flex-1 truncate text-sm">
                    {index + 1}. {uuid}
                  </code>
                  <CopyButton value={uuid} label="复制" />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
