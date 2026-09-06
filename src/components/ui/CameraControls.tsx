import { motion } from 'framer-motion';
import { Focus, Scan } from 'lucide-react';
import { CameraCapabilities, ZOOM_PRESETS } from '../../hooks/useCamera';

interface Props {
  zoom: number;
  focusLocked: boolean;
  capabilities: CameraCapabilities;
  onZoom: (factor: number) => void;
  onToggleFocusLock: () => void;
}

export function CameraControls({
  zoom,
  focusLocked,
  capabilities,
  onZoom,
  onToggleFocusLock,
}: Props) {
  // Only offer presets the device can plausibly honor. Wide-angle (<1) is kept
  // when the hook reports a reachable wide view — either native sub-1x zoom or
  // a dedicated ultra-wide rear camera it can switch to. Otherwise it's dropped
  // since CSS can't widen the field of view.
  const presets = ZOOM_PRESETS.filter((p) => p >= 1 || capabilities.wideAngle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-[22px] px-1.5 py-1.5 flex items-center gap-1"
    >
      {/* Zoom presets */}
      <div className="flex items-center gap-1" role="group" aria-label="Camera zoom">
        {presets.map((preset) => {
          const active = Math.abs(zoom - preset) < 0.01;
          const label = preset === 1 ? '1×' : `${preset}×`;
          return (
            <motion.button
              key={preset}
              whileTap={{ scale: 0.9 }}
              onClick={() => onZoom(preset)}
              aria-label={`Zoom ${label}`}
              aria-pressed={active}
              title={`Zoom ${label}`}
              className={`
                min-w-[44px] h-11 px-2 rounded-2xl text-[13px] font-semibold tabular-nums
                flex items-center justify-center transition-all duration-200
                focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-transparent
                ${active
                  ? 'glass-btn-active text-accent-hover'
                  : 'text-ink-soft hover:glass-btn hover:text-ink'}
              `}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      <div className="w-px h-6 shrink-0 bg-border-subtle mx-0.5" />

      {/* Focus lock */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onToggleFocusLock}
        aria-label={focusLocked ? 'Unlock focus' : 'Lock focus'}
        aria-pressed={focusLocked}
        title={focusLocked ? 'Unlock focus' : 'Lock focus'}
        className={`
          h-11 shrink-0 px-3 rounded-2xl flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-200
          focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-transparent
          ${focusLocked
            ? 'glass-btn-active text-accent-hover'
            : 'text-ink-soft hover:glass-btn hover:text-ink'}
        `}
      >
        {focusLocked ? <Focus size={18} /> : <Scan size={18} />}
        <span>{focusLocked ? 'AF lock' : 'AF'}</span>
      </motion.button>
    </motion.div>
  );
}
