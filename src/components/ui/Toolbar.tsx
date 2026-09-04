import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Lock,
  Unlock,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  X,
  Camera,
  CameraOff,
  FlipHorizontal,
  SlidersHorizontal,
} from 'lucide-react';

interface ToolbarBtnProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

function ToolbarBtn({ onClick, label, children, active, danger, disabled }: ToolbarBtnProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        relative w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200
        focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-transparent
        ${disabled ? 'opacity-35 cursor-not-allowed' : ''}
        ${active
          ? 'glass-btn-active text-accent-hover'
          : danger
            ? 'text-[#b3573f] hover:glass-btn hover:text-[#9e4a34]'
            : 'text-ink-soft hover:glass-btn hover:text-ink'
        }
      `}
    >
      {children}
    </motion.button>
  );
}

function Divider() {
  return <div className="w-px h-6 shrink-0 bg-border-subtle mx-0.5" />;
}

interface Props {
  hasImage: boolean;
  locked: boolean;
  tracingMode: boolean;
  isFullscreen: boolean;
  cameraActive: boolean;
  cameraSupported: boolean;
  onUpload: () => void;
  onLock: () => void;
  onTracing: () => void;
  onFullscreen: () => void;
  onClose: () => void;
  onCameraToggle: () => void;
  onCameraFlip: () => void;
  onAdjust: () => void;
}

export function Toolbar({
  hasImage,
  locked,
  tracingMode,
  isFullscreen,
  cameraActive,
  cameraSupported,
  onUpload,
  onLock,
  onTracing,
  onFullscreen,
  onClose,
  onCameraToggle,
  onCameraFlip,
  onAdjust,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-[24px] px-1.5 py-1.5 flex items-center gap-0.5 max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar"
    >
      {/* Camera */}
      {cameraSupported && (
        <>
          <ToolbarBtn
            onClick={onCameraToggle}
            label={cameraActive ? 'Stop camera' : 'Start camera'}
            active={cameraActive}
          >
            {cameraActive ? <CameraOff size={19} /> : <Camera size={19} />}
          </ToolbarBtn>

          {cameraActive && (
            <ToolbarBtn onClick={onCameraFlip} label="Flip camera">
              <FlipHorizontal size={19} />
            </ToolbarBtn>
          )}

          <Divider />
        </>
      )}

      <ToolbarBtn onClick={onUpload} label="Upload image">
        <Upload size={19} />
      </ToolbarBtn>

      {hasImage && (
        <>
          <ToolbarBtn onClick={onAdjust} label="Adjust image">
            <SlidersHorizontal size={19} />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            onClick={onLock}
            label={locked ? 'Unlock' : 'Lock'}
            active={locked}
          >
            {locked ? <Lock size={19} /> : <Unlock size={19} />}
          </ToolbarBtn>

          <ToolbarBtn
            onClick={onTracing}
            label={tracingMode ? 'Exit tracing' : 'Tracing mode'}
            active={tracingMode}
          >
            {tracingMode ? <EyeOff size={19} /> : <Eye size={19} />}
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={onClose} label="Close image" danger>
            <X size={19} />
          </ToolbarBtn>
        </>
      )}

      <Divider />

      <ToolbarBtn
        onClick={onFullscreen}
        label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
      </ToolbarBtn>
    </motion.div>
  );
}
