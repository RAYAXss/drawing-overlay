import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Pencil } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
  onOpenFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Animated "sketch hero": an SVG line-drawing that traces itself as if being
 * sketched by hand, with a pencil nib following the stroke.
 */
function SketchHero() {
  const outline =
    'M20 96 L20 52 L60 20 L100 52 L100 96 Z M46 96 L46 66 L74 66 L74 96';
  const sun = 'M96 24 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        initial="hidden"
        animate="visible"
      >
        <motion.line
          x1="8" y1="104" x2="112" y2="104"
          stroke="var(--stone)" strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeInOut' }}
        />
        <motion.path
          d={sun}
          fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeInOut' }}
        />
        <motion.path
          d={outline}
          fill="none" stroke="var(--ink)" strokeWidth="2.75"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 0.5, ease: 'easeInOut' }}
        />
      </motion.svg>

      <motion.div
        className="absolute -top-1 -left-1 text-accent-hover"
        initial={{ opacity: 0, x: 0, y: 96, rotate: 40 }}
        animate={{
          opacity: [0, 1, 1, 0],
          x: [10, 90, 20, 60],
          y: [96, 24, 96, 40],
          rotate: 40,
        }}
        transition={{ duration: 2.7, delay: 0.5, ease: 'easeInOut', times: [0, 0.1, 0.6, 1] }}
        style={{ transformOrigin: 'bottom left' }}
      >
        <Pencil size={18} />
      </motion.div>
    </div>
  );
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
    <div className="relative flex flex-col items-center justify-center w-full h-full px-5 pb-20 pt-safe overflow-y-auto no-scrollbar">
      {/* Floating paper scraps — desktop only */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute w-12 h-14 sm:w-24 sm:h-28 rounded-sm bg-paper-100 border border-border-subtle"
        style={{ top: '12%', left: '6%', boxShadow: 'var(--card-shadow)', rotate: '-8deg' }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute w-12 h-14 sm:w-24 sm:h-28 rounded-sm bg-paper-50 border border-border-subtle"
        style={{ bottom: '12%', right: '6%', boxShadow: 'var(--card-shadow)', rotate: '7deg' }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Header — compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-5 text-center shrink-0"
      >
        <SketchHero />

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-1.5 text-xl font-light tracking-tight text-ink"
        >
          Drawing Overlay
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-ink-soft text-[13px] leading-relaxed max-w-[260px] mx-auto font-light mt-1"
        >
          Drop a reference, fade it over your camera, and trace.
        </motion.p>
      </motion.div>

      {/* Drop zone — compact, well-rounded */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-[300px] shrink-0 rounded-3xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-3 py-6 px-6 paper-card
          ${dragging
            ? 'border-accent scale-[1.02] paper-card-strong'
            : 'border-[rgba(120,100,70,0.30)] hover:border-accent/60'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image by clicking or dropping a file"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <motion.div
          animate={{ scale: dragging ? 1.12 : 1, y: dragging ? -2 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-accent-hover bg-accent-muted"
        >
          <Upload size={20} />
        </motion.div>

        <div className="text-center">
          <p className="text-[13px] font-medium text-ink mb-0.5">
            {dragging ? 'Release to import' : 'Drop image here'}
          </p>
          <p className="text-[11px] text-ink-soft font-light">or tap to browse</p>
        </div>

        <div className="flex items-center gap-1">
          {['PNG', 'JPG', 'WEBP'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md text-[9px] font-medium text-ink-faint bg-paper-100 border border-border-subtle"
            >
              {fmt}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
