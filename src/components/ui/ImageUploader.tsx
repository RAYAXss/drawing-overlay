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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so same file can be re-selected
    e.target.value = '';
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
          <div className="w-8 h-8 rounded-lg bg-accent-muted border border-accent/30 flex items-center justify-center">
            <ImagePlus size={16} className="text-accent" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Drawing Overlay</h1>
        </div>
        <p className="text-[#8888a0] text-sm leading-relaxed max-w-xs mx-auto">
          Import an image, adjust opacity and blur, then use your screen as a transparent reference layer for tracing.
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
          relative w-full max-w-sm rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-4 p-10
          ${dragging
            ? 'border-accent bg-accent-muted scale-[1.01]'
            : 'border-[rgba(255,255,255,0.12)] bg-surface-2 hover:border-[rgba(255,255,255,0.22)] hover:bg-surface-3'
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
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            dragging ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-[#6666a0]'
          }`}
        >
          <Upload size={22} />
        </motion.div>

        <div className="text-center">
          <p className="text-sm font-medium text-[#c8c8e0] mb-1">
            {dragging ? 'Drop to import' : 'Drop image here'}
          </p>
          <p className="text-xs text-[#5a5a78]">or click to browse</p>
        </div>

        <div className="flex items-center gap-1.5">
          {['PNG', 'JPG', 'WEBP'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[#7070a0] bg-surface-3 border border-[rgba(255,255,255,0.06)]"
            >
              {fmt}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Upload button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-5"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-surface-0"
        >
          <Upload size={14} />
          Upload image
        </motion.button>
      </motion.div>

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 text-[11px] text-[#44445a]"
      >
        <kbd className="font-mono bg-surface-3 border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded text-[#5a5a78]">Ctrl+O</kbd>
        {' '}to open
      </motion.p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        className="hidden"
        onChange={handleInputChange}
        aria-label="File input"
      />
    </div>
  );
}
