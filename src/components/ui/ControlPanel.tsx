import React, { useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { DrawingState } from '../../types/drawing';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  disabled?: boolean;
  onChange: (v: number) => void;
  displayValue?: string;
}

function Slider({ label, value, min, max, step, unit, disabled, onChange, displayValue }: SliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  }, [onChange]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-ink tracking-tight">
          {label}
        </label>
        <span className="text-[13px] font-normal text-ink-soft tabular-nums">
          {displayValue ?? `${value}${unit}`}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute inset-x-0 h-2.5 rounded-full bg-white/40"
          style={{ boxShadow: 'inset 0 1px 2px rgba(120,100,70,0.2), inset 0 -1px 0 rgba(255,255,255,0.6)' }}
        />
        <div
          className="absolute left-0 h-2.5 rounded-full transition-none"
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
          aria-label={`${label}: ${displayValue ?? value}${unit}`}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ margin: 0 }}
        />
        <div
          className="absolute w-6 h-6 rounded-full transition-none"
          style={{
            left: `calc(${pct}% - 12px)`,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, #ffffff 0%, #F2EDE4 100%)',
            boxShadow: '0 3px 8px rgba(120,100,70,0.3), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(168,152,128,0.3)',
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  state: DrawingState;
  onOpacityChange: (v: number) => void;
  onBlurChange: (v: number) => void;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onReset: () => void;
}

export function ControlPanel({
  open,
  onClose,
  state,
  onOpacityChange,
  onBlurChange,
  onScaleChange,
  onRotationChange,
  onReset,
}: Props) {
  const { opacity, blur, scale, rotation, locked } = state;

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 500) {
      onClose();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dimmed warm backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[rgba(44,36,22,0.18)] pointer-events-auto"
          />

          {/* iOS slide-up sheet */}
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
            className="glass-strong fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] px-5 pt-3 pb-safe pointer-events-auto"
            role="dialog"
            aria-label="Image adjustments"
          >
            {/* Grabber handle */}
            <div className="w-full flex justify-center pb-3 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-ink-faint/40" />
            </div>

            <h2 className="text-[15px] font-semibold text-ink tracking-tight mb-4">Adjust</h2>

            <div className="flex flex-col gap-5 pb-5">
              <Slider
                label="Opacity"
                value={opacity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={onOpacityChange}
              />
              <Slider
                label="Blur"
                value={blur}
                min={0}
                max={20}
                step={0.5}
                unit="px"
                onChange={onBlurChange}
              />
              <Slider
                label="Zoom"
                value={scale}
                min={0.25}
                max={3}
                step={0.01}
                unit="×"
                disabled={locked}
                onChange={onScaleChange}
                displayValue={`${scale.toFixed(2)}×`}
              />
              <Slider
                label="Rotation"
                value={rotation}
                min={-180}
                max={180}
                step={1}
                unit="°"
                disabled={locked}
                onChange={onRotationChange}
                displayValue={`${Math.round(rotation)}°`}
              />

              <motion.button
                whileTap={{ scale: locked ? 1 : 0.97 }}
                onClick={onReset}
                disabled={locked}
                aria-label="Reset transform"
                className={`
                  flex items-center justify-center gap-2 w-full min-h-[52px] rounded-2xl text-sm font-medium transition-all
                  ${locked
                    ? 'opacity-35 cursor-not-allowed text-ink-faint glass-btn'
                    : 'text-ink glass-btn hover:brightness-105'
                  }
                `}
              >
                <RotateCcw size={15} />
                Reset transform
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
