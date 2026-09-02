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
  HelpCircle,
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
        relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200
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

interface Props {
  hasImage: boolean;
  locked: boolean;
  tracingMode: boolean;
  isFullscreen: boolean;
  showHelp: boolean;
  cameraActive: boolean;
  cameraSupported: boolean;
  onUpload: () => void;
  onLock: () => void;
  onTracing: () => void;
  onFullscreen: () => void;
  onHelp: () => void;
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
  showHelp,
  cameraActive,
  cameraSupported,
  onUpload,
  onLock,
  onTracing,
  onFullscreen,
  onHelp,
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
      className="glass rounded-[28px] px-2 py-2 flex items-center gap-1"
    >
      {/* Camera */}
      {cameraSupported && (
        <>
          <ToolbarBtn
            onClick={onCameraToggle}
            label={cameraActive ? 'Stop camera' : 'Start camera (C)'}
            active={cameraActive}
          >
            {cameraActive ? <CameraOff size={20} /> : <Camera size={20} />}
          </ToolbarBtn>

          {cameraActive && (
            <ToolbarBtn onClick={onCameraFlip} label="Flip camera">
              <FlipHorizontal size={20} />
            </ToolbarBtn>
          )}

          <div className="w-px h-6 bg-border-subtle mx-0.5" />
        </>
      )}

      <ToolbarBtn onClick={onUpload} label="Upload image (Ctrl+O)">
        <Upload size={20} />
      </ToolbarBtn>

      {hasImage && (
        <>
          <ToolbarBtn onClick={onAdjust} label="Adjust image">
            <SlidersHorizontal size={20} />
          </ToolbarBtn>

          <div className="w-px h-6 bg-border-subtle mx-0.5" />

          <ToolbarBtn
            onClick={onLock}
            label={locked ? 'Unlock (L)' : 'Lock (L)'}
            active={locked}
          >
            {locked ? <Lock size={20} /> : <Unlock size={20} />}
          </ToolbarBtn>

          <ToolbarBtn
            onClick={onTracing}
            label={tracingMode ? 'Exit tracing (Esc)' : 'Tracing mode'}
            active={tracingMode}
          >
            {tracingMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </ToolbarBtn>

          <div className="w-px h-6 bg-border-subtle mx-0.5" />

          <ToolbarBtn onClick={onClose} label="Close image" danger>
            <X size={20} />
          </ToolbarBtn>
        </>
      )}

      <div className="w-px h-6 bg-border-subtle mx-0.5" />

      <ToolbarBtn
        onClick={onFullscreen}
        label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </ToolbarBtn>

      <ToolbarBtn onClick={onHelp} label="Keyboard shortcuts" active={showHelp}>
        <HelpCircle size={20} />
      </ToolbarBtn>
    </motion.div>
  );
}
