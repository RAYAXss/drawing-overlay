import { motion } from 'framer-motion';
import { Focus, Scan } from 'lucide-react';
import { CameraCapabilities } from '../../hooks/useCamera';

interface Props {
  zoom: number;
  focusLocked: boolean;
  capabilities: CameraCapabilities;
  onZoom: (factor: number) => void;
  onToggleFocusLock: () => void;
}

/**
 * Build the zoom presets for the current device.
 *
 * The wide-angle preset uses the SMALLEST field of view the hardware can
 * actually reach, not a hardcoded 0.5×:
 *   - If the sensor exposes native sub-1× zoom, use its real `zoomMin`
 *     (e.g. 0.6× or 0.8× on phones that don't go all the way to 0.5×).
 *   - If only a dedicated ultra-wide rear lens exists, that lens is treated as
 *     the widest reachable view and shown as 0.5×.
 * The preset is dropped entirely when no wider view is reachable.
 */
function buildPresets(caps: CameraCapabilities): number[] {
  const presets: number[] = [];

  if (caps.wideAngle) {
    if (caps.nativeZoom && caps.zoomMin < 1) {
      // Real minimum the sensor reports, rounded to a clean 2-decimal value.
      presets.push(Math.round(caps.zoomMin * 100) / 100);
    } else {
      // Ultra-wide lens switch: labelled 0.5× by convention.
      presets.push(0.5);
    }
  }

  presets.push(1, 2);
  return presets;
}

/** Format a zoom factor as a compact label: 1×, 0.6×, 2×. */
function formatZoom(z: number): string {
  if (z === 1) return '1×';
  // Trim trailing zeros: 0.60 -> 0.6, 2.00 -> 2
  const s = z.toFixed(2).replace(/\.?0+$/, '');
  return `${s}×`;
}

export function CameraControls({
  zoom,
  focusLocked,
  capabilities,
  onZoom,
  onToggleFocusLock,
}: Props) {
  const presets = buildPresets(capabilities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="paper-card rounded-[22px] px-1.5 py-1.5 flex items-center gap-1"
    >
      {/* Zoom presets */}
      <div className="flex items-center gap-1" role="group" aria-label="Camera zoom">
        {presets.map((preset) => {
          const active = Math.abs(zoom - preset) < 0.01;
          const label = formatZoom(preset);
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
                  ? 'paper-btn-active text-accent-hover'
                  : 'text-ink-soft paper-btn hover:text-ink'}
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
            ? 'paper-btn-active text-accent-hover'
            : 'text-ink-soft paper-btn hover:text-ink'}
        `}
      >
        {focusLocked ? <Focus size={18} /> : <Scan size={18} />}
        <span>{focusLocked ? 'AF lock' : 'AF'}</span>
      </motion.button>
    </motion.div>
  );
}
