import { useEffect, useRef, useState } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
}

export default function CopyButton({ value, label = '复制' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => clearTimeout(timerRef.current ?? undefined), []);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    clearTimeout(timerRef.current ?? undefined);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button type="button" onClick={copy} className="btn-secondary">
      {copied ? '已复制' : label}
    </button>
  );
}
