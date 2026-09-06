import React, { useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  RotateCcw,
  RotateCw,
  Sun,
  Maximize2,
  Minus,
  Plus,
} from 'lucide-react';
import { DrawingState } from '../../types/drawing';

interface SliderProps {
  label: string;
  icon?: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (v: number) => void;
  displayValue: string;
  /** Optional stepper buttons for precise nudging. */
  onStep?: (dir: -1 | 1) => void;
}

function Slider({
  label,
  icon,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  displayValue,
  onStep,
}: SliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value)),
    [onChange]
  );

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-medium text-ink tracking-tight">
          {icon && <span className="text-accent-hover">{icon}</span>}
          {label}
        </label>
        <span className="text-[13px] font-semibold text-ink-soft tabular-nums px-2 py-0.5 rounded-lg bg-white/45">
          {displayValue}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {onStep && (
          <button
            onClick={() => onStep(-1)}
            aria-label={`Decrease ${label}`}
            className="w-9 h-9 shrink-0 rounded-xl glass-btn flex items-center justify-center text-ink-soft active:scale-90 transition-transform"
          >
            <Minus size={15} />
          </button>
        )}

        <div className="relative h-9 flex-1 flex items-center">
          <div
            className="absolute inset-x-0 h-3 rounded-full bg-white/40"
            style={{ boxShadow: 'inset 0 1px 2px rgba(120,100,70,0.2), inset 0 -1px 0 rgba(255,255,255,0.6)' }}
          />
          <div
            className="absolute left-0 h-3 rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(180deg, #C8BCA8 0%, #A89880 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            aria-label={`${label}: ${displayValue}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ margin: 0 }}
          />
          <div
            className="absolute w-7 h-7 rounded-full"
            style={{
              left: `calc(${pct}% - 14px)`,
              pointerEvents: 'none',
              background: 'linear-gradient(180deg, #ffffff 0%, #F2EDE4 100%)',
              boxShadow:
                '0 3px 9px rgba(120,100,70,0.32), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(168,152,128,0.3)',
            }}
          />
        </div>

        {onStep && (
          <button
            onClick={() => onStep(1)}
            aria-label={`Increase ${label}`}
            className="w-9 h-9 shrink-0 rounded-xl glass-btn flex items-center justify-center text-ink-soft active:scale-90 transition-transform"
          >
            <Plus size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

interface QuickActionProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function QuickAction({ onClick, label, disabled, children }: QuickActionProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        flex flex-col items-center justify-center gap-1 h-[58px] rounded-2xl text-[11px] font-medium
        transition-all glass-btn
        ${disabled ? 'opacity-35 cursor-not-allowed text-ink-faint' : 'text-ink-soft hover:text-ink'}
      `}
    >
      {children}
      <span className="tracking-tight">{label}</span>
    </motion.button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  state: DrawingState;
  onOpacityChange: (v: number) => void;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onReset: () => void;
}

export function ControlPanel({
  open,
  onClose,
  state,
  onOpacityChange,
  onScaleChange,
  onRotationChange,
  onReset,
}: Props) {
  const { opacity, scale, rotation, locked } = state;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 90 || info.velocity.y > 500) onClose();
    },
    [onClose]
  );

  const rotateBy = useCallback(
    (deg: number) => {
      let next = rotation + deg;
      // keep within -180..180
      next = ((next + 180) % 360 + 360) % 360 - 180;
      onRotationChange(next);
    },
    [rotation, onRotationChange]
  );

  const nudgeOpacity = useCallback(
    (dir: -1 | 1) => onOpacityChange(Math.min(100, Math.max(0, opacity + dir * 5))),
    [opacity, onOpacityChange]
  );
  const nudgeScale = useCallback(
    (dir: -1 | 1) => onScaleChange(Math.min(3, Math.max(0.25, +(scale + dir * 0.05).toFixed(2)))),
    [scale, onScaleChange]
  );
  const nudgeRotation = useCallback(
    (dir: -1 | 1) => rotateBy(dir * 1),
    [rotateBy]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[rgba(44,36,22,0.22)] pointer-events-auto"
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="glass-strong fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] px-5 pt-2 pb-safe pointer-events-auto max-w-lg mx-auto"
            role="dialog"
            aria-label="Image adjustments"
          >
            {/* Grabber */}
            <div className="w-full flex justify-center py-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-ink-faint/40" />
            </div>

            {/* Title */}
            <div className="flex items-center justify-between mb-4 px-0.5">
              <h2 className="text-[15px] font-semibold text-ink tracking-tight">Adjust image</h2>
              {locked && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft px-2.5 py-1 rounded-full bg-white/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Locked
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5 pb-4">
              <Slider
                label="Opacity"
                icon={<Sun size={14} />}
                value={opacity}
                min={0}
                max={100}
                step={1}
                onChange={onOpacityChange}
                onStep={nudgeOpacity}
                displayValue={`${Math.round(opacity)}%`}
              />

              <Slider
                label="Zoom"
                icon={<Maximize2 size={14} />}
                value={scale}
                min={0.25}
                max={3}
                step={0.01}
                disabled={locked}
                onChange={onScaleChange}
                onStep={nudgeScale}
                displayValue={`${scale.toFixed(2)}×`}
              />

              <Slider
                label="Rotation"
                icon={<RotateCw size={14} />}
                value={rotation}
                min={-180}
                max={180}
                step={1}
                disabled={locked}
                onChange={onRotationChange}
                onStep={nudgeRotation}
                displayValue={`${Math.round(rotation)}°`}
              />

              {/* Quick actions */}
              <div className={`grid grid-cols-3 gap-2.5 ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
                <QuickAction label="-90°" onClick={() => rotateBy(-90)} disabled={locked}>
                  <RotateCcw size={18} />
                </QuickAction>
                <QuickAction label="+90°" onClick={() => rotateBy(90)} disabled={locked}>
                  <RotateCw size={18} />
                </QuickAction>
                <QuickAction label="Reset" onClick={onReset} disabled={locked}>
                  <Maximize2 size={18} />
                </QuickAction>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
