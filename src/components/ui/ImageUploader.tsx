import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImagePlus } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
  onOpenFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ImageUploader({ onFile, fileInputRef }: Props) {
  const [dragging, setDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  // Global drag-over effect
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center">
            <ImagePlus size={18} className="text-accent-hover" />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-ink">Drawing Overlay</h1>
        </div>
        <p className="text-ink-soft text-sm leading-relaxed max-w-xs mx-auto font-light">
          Import an image, adjust its opacity, then use your screen as a transparent reference layer for tracing.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-sm rounded-[28px] border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-4 p-10
          ${dragging
            ? 'border-accent bg-accent-muted scale-[1.02] glass-strong'
            : 'border-[rgba(140,122,98,0.3)] glass hover:border-accent/50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image by clicking or dropping a file"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <motion.div
          animate={{ scale: dragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors glass-btn ${
            dragging ? 'text-accent-hover' : 'text-accent-hover'
          }`}
        >
          <Upload size={24} />
        </motion.div>

        <div className="text-center">
          <p className="text-sm font-medium text-ink mb-1">
            {dragging ? 'Drop to import' : 'Drop image here'}
          </p>
          <p className="text-xs text-ink-soft font-light">or tap to browse</p>
        </div>

        <div className="flex items-center gap-1.5">
          {['PNG', 'JPG', 'WEBP'].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-ink-soft bg-white/50 border border-border-subtle"
            >
              {fmt}
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
