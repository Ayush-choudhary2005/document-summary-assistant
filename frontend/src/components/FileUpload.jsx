import { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = '.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ files, onFilesSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (incoming.length) onFilesSelected(incoming);
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        aria-disabled={disabled}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors
          ${isDragging ? 'border-marker bg-marker/10' : 'border-ink/25 dark:border-paper/25 hover:border-moss dark:hover:border-marker'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <p className="font-display text-xl text-ink dark:text-paper">
          Drop your document{files.length !== 1 ? 's' : ''} here
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
          or click to browse — PDF, PNG, JPG, WEBP, BMP, TIFF
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-ink/10 dark:divide-paper/10 rounded-lg border border-ink/10 dark:border-paper/10">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span className="truncate pr-3 text-ink dark:text-paper">{file.name}</span>
              <span className="shrink-0 font-mono text-xs text-ink/50 dark:text-paper/50">
                {formatBytes(file.size)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
