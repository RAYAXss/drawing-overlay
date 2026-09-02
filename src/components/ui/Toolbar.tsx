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
      whileHover={{ scale: disabled ? 1 : 1.06 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`
        relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors
        focus-visible:ring-2 ring-accent ring-offset-1 ring-offset-transparent
        ${disabled ? 'opacity-35 cursor-not-allowed' : ''}
        ${active
          ? 'bg-accent/20 text-accent border border-accent/30'
          : danger
            ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
            : 'text-[#8888a8] hover:bg-surface-3 hover:text-[#c8c8e0]'
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
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl px-2 py-2 flex items-center gap-1"
    >
      {/* Camera */}
      {cameraSupported && (
        <>
          <ToolbarBtn
            onClick={onCameraToggle}
            label={cameraActive ? 'Stop camera' : 'Start camera (C)'}
            active={cameraActive}
          >
            {cameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
          </ToolbarBtn>

          {cameraActive && (
            <ToolbarBtn
              onClick={onCameraFlip}
              label="Flip camera"
            >
              <FlipHorizontal size={16} />
            </ToolbarBtn>
          )}

          <div className="w-px h-5 bg-border-subtle mx-0.5" />
        </>
      )}

      <ToolbarBtn onClick={onUpload} label="Upload image (Ctrl+O)">
        <Upload size={16} />
      </ToolbarBtn>

      {hasImage && (
        <>
          <div className="w-px h-5 bg-border-subtle mx-0.5" />

          <ToolbarBtn
            onClick={onLock}
            label={locked ? 'Unlock (L)' : 'Lock (L)'}
            active={locked}
          >
            {locked ? <Lock size={16} /> : <Unlock size={16} />}
          </ToolbarBtn>

          <ToolbarBtn
            onClick={onTracing}
            label={tracingMode ? 'Exit tracing (Esc)' : 'Tracing mode'}
            active={tracingMode}
          >
            {tracingMode ? <EyeOff size={16} /> : <Eye size={16} />}
          </ToolbarBtn>

          <div className="w-px h-5 bg-border-subtle mx-0.5" />

          <ToolbarBtn onClick={onClose} label="Close image" danger>
            <X size={16} />
          </ToolbarBtn>
        </>
      )}

      <div className="w-px h-5 bg-border-subtle mx-0.5" />

      <ToolbarBtn
        onClick={onFullscreen}
        label={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </ToolbarBtn>

      <ToolbarBtn
        onClick={onHelp}
        label="Keyboard shortcuts"
        active={showHelp}
      >
        <HelpCircle size={16} />
      </ToolbarBtn>
    </motion.div>
  );
}
