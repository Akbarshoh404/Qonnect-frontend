import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatFileSize, getFileIcon } from '../../utils/helpers';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  currentFile?: File | null;
  label?: string;
  hint?: string;
  error?: string;
}

export function FileDropzone({
  onFileSelect,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB
  currentFile,
  label,
  hint,
  error,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const [rejectedFile, setRejectedFile] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setRejectedFile(null);
      if (rejectedFiles.length > 0) {
        const rejection = (rejectedFiles[0] as { errors: { code: string; message: string }[] });
        const code = rejection.errors[0]?.code;
        if (code === 'file-too-large') {
          setRejectedFile(t('fileDropzone.tooLarge', { size: formatFileSize(maxSize) }));
        } else if (code === 'file-invalid-type') {
          setRejectedFile(t('fileDropzone.invalidType'));
        } else {
          setRejectedFile(t('fileDropzone.notAccepted'));
        }
        return;
      }
      if (acceptedFiles[0]) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSize, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const displayError = rejectedFile || error;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>}

      {currentFile ? (
        <div className="flex items-center gap-3 p-4 bg-slate-900/[0.03] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl">
          <span className="text-2xl">{getFileIcon(currentFile.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{currentFile.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{formatFileSize(currentFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null as unknown as File)}
            className="p-1.5 rounded-lg hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed',
            'cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-900/15 hover:border-slate-900/30 hover:bg-slate-900/[0.03] dark:border-white/15 dark:hover:border-white/30 dark:hover:bg-white/5',
            displayError && 'border-red-500/50'
          )}
        >
          <input {...getInputProps()} />
          <div className={cn(
            'p-3 rounded-xl transition-colors',
            isDragActive ? 'bg-indigo-500/20' : 'bg-slate-900/5 dark:bg-white/5'
          )}>
            {isDragActive ? (
              <Upload size={24} className="text-indigo-500 dark:text-indigo-400" />
            ) : (
              <File size={24} className="text-slate-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isDragActive ? t('fileDropzone.dropHere') : t('fileDropzone.dropOrBrowse')}
            </p>
            {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{t('fileDropzone.max', { size: formatFileSize(maxSize) })}</p>
          </div>
        </div>
      )}

      {displayError && <p className="text-xs text-red-500 dark:text-red-400">{displayError}</p>}
    </div>
  );
}
