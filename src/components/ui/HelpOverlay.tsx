import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['C'], label: 'Start / stop camera' },
  { keys: ['Ctrl', 'O'], label: 'Import image' },
  { keys: ['L'], label: 'Lock / Unlock' },
  { keys: ['F'], label: 'Toggle fullscreen' },
  { keys: ['R'], label: 'Reset transform' },
  { keys: ['Space'], label: 'Show / hide UI' },
  { keys: ['Esc'], label: 'Exit tracing mode' },
];

const GESTURES = [
  { gesture: '1 finger drag', label: 'Move image' },
  { gesture: '2 finger pinch', label: 'Zoom image' },
  { gesture: '2 finger twist', label: 'Rotate image' },
  { gesture: 'Scroll wheel', label: 'Zoom image' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelpOverlay({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="glass rounded-2xl p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">Keyboard shortcuts</h2>
                <button
                  onClick={onClose}
                  aria-label="Close help"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7070a0] hover:text-white hover:bg-surface-3 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1 mb-5">
                {SHORTCUTS.map(({ keys, label }) => (
                  <div key={label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-[#8888a8]">{label}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k, i) => (
                        <React.Fragment key={k}>
                          <kbd className="px-2 py-0.5 rounded-md text-[11px] font-mono text-[#a0a0c0] bg-surface-3 border border-border-subtle">
                            {k}
                          </kbd>
                          {i < keys.length - 1 && (
                            <span className="text-[#44445a] text-[10px]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border-subtle mb-4" />

              <p className="text-[11px] font-medium text-[#5a5a78] uppercase tracking-wide mb-2">Touch gestures</p>
              <div className="space-y-1">
                {GESTURES.map(({ gesture, label }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-[#8888a8]">{label}</span>
                    <span className="text-[11px] text-[#5a5a78] font-mono">{gesture}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
