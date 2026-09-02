import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
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
    <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[#7070a0] tracking-wide uppercase">
          {label}
        </label>
        <span className="text-[11px] font-mono text-[#9090b8] tabular-nums">
          {displayValue ?? `${value}${unit}`}
        </span>
      </div>
      <div className="relative h-1.5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-3" />
        <div
          className="absolute left-0 h-1.5 rounded-full bg-accent/60 transition-none"
          style={{ width: `${pct}%` }}
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
          className="absolute w-3.5 h-3.5 rounded-full bg-white border border-[rgba(255,255,255,0.3)] shadow-md transition-none"
          style={{
            left: `calc(${pct}% - 7px)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

interface Props {
  state: DrawingState;
  onOpacityChange: (v: number) => void;
  onBlurChange: (v: number) => void;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onReset: () => void;
}

export function ControlPanel({
  state,
  onOpacityChange,
  onBlurChange,
  onScaleChange,
  onRotationChange,
  onReset,
}: Props) {
  const { opacity, blur, scale, rotation, locked } = state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-4 w-52 flex flex-col gap-4"
    >
      <Slider
        label="Opacity"
        value={opacity}
        min={0}
        max={100}
        step={1}
        unit="%"
        disabled={false}
        onChange={onOpacityChange}
      />
      <Slider
        label="Blur"
        value={blur}
        min={0}
        max={20}
        step={0.5}
        unit="px"
        disabled={false}
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

      <div className="h-px bg-border-subtle" />

      <motion.button
        whileHover={{ scale: locked ? 1 : 1.03 }}
        whileTap={{ scale: locked ? 1 : 0.96 }}
        onClick={onReset}
        disabled={locked}
        aria-label="Reset transform"
        className={`
          flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-colors
          ${locked
            ? 'opacity-35 cursor-not-allowed text-[#6060a0] bg-surface-3'
            : 'text-[#a0a0c8] bg-surface-3 hover:bg-surface-4 hover:text-white border border-border-subtle'
          }
        `}
      >
        <RotateCcw size={12} />
        Reset transform
      </motion.button>
    </motion.div>
  );
}
