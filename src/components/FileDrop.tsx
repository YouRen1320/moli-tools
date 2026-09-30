import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface FileDropProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  hint?: string;
}

export default function FileDrop({ accept, multiple = false, onFiles, hint }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (list && list.length > 0) onFiles(Array.from(list));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    emit(event.dataTransfer.files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    emit(event.target.files);
    event.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="选择文件"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <p className="text-sm font-medium text-neutral-700">点击选择，或把文件拖到这里</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
