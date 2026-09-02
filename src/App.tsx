import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { DrawingState, DEFAULT_STATE, Position } from './types/drawing';
import { useImage } from './hooks/useImage';
import { useFullscreen } from './hooks/useFullscreen';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoHideUI } from './hooks/useAutoHideUI';
import { usePersistentSettings } from './hooks/usePersistentSettings';
import { useCamera } from './hooks/useCamera';
import { ImageUploader } from './components/ui/ImageUploader';
import { ImageCanvas } from './components/ui/ImageCanvas';
import { CameraBackground } from './components/ui/CameraBackground';
import { ControlPanel } from './components/ui/ControlPanel';
import { Toolbar } from './components/ui/Toolbar';
import { HelpOverlay } from './components/ui/HelpOverlay';
import { NotificationToast } from './components/ui/NotificationToast';
import { clamp } from './utils/image';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageUrl, loadFile, clearImage, notification, showNotification } = useImage();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { load: loadSettings, save: saveSettings } = usePersistentSettings();
  const { videoRef, state: cameraState, start: startCamera, stop: stopCamera, toggleFacing } = useCamera();

  const [drawingState, setDrawingState] = useState<DrawingState>(() => {
    const saved = loadSettings();
    return { ...DEFAULT_STATE, ...saved };
  });

  const [showHelp, setShowHelp] = useState(false);
  const [uiManuallyHidden, setUiManuallyHidden] = useState(false);

  const hasImage = !!imageUrl;
  const isTracingMode = drawingState.tracingMode;
  const hasContent = hasImage || cameraState.active;

  const { uiVisible, showUI, forceShow } = useAutoHideUI(hasContent && !isTracingMode);

  useEffect(() => {
    setDrawingState(prev => ({ ...prev, fullscreen: isFullscreen }));
  }, [isFullscreen]);

  useEffect(() => {
    saveSettings({
      opacity: drawingState.opacity,
      blur: drawingState.blur,
      scale: drawingState.scale,
      rotation: drawingState.rotation,
      position: drawingState.position,
      locked: drawingState.locked,
    });
  }, [drawingState.opacity, drawingState.blur, drawingState.scale, drawingState.rotation, drawingState.position, drawingState.locked, saveSettings]);

  // Show camera error as notification
  useEffect(() => {
    if (cameraState.error) {
      showNotification('Camera access denied or unavailable.', 'error');
    }
  }, [cameraState.error, showNotification]);

  // --- Transform setters ---
  const setOpacity = useCallback((v: number) => setDrawingState(prev => ({ ...prev, opacity: clamp(v, 0, 100) })), []);
  const setBlur = useCallback((v: number) => setDrawingState(prev => ({ ...prev, blur: clamp(v, 0, 20) })), []);
  const setScale = useCallback((v: number) => setDrawingState(prev => ({ ...prev, scale: clamp(v, 0.25, 3) })), []);
  const setRotation = useCallback((v: number) => setDrawingState(prev => ({ ...prev, rotation: Math.max(-180, Math.min(180, v)) })), []);
  const setPosition = useCallback((pos: Position) => setDrawingState(prev => ({ ...prev, position: pos })), []);

  const toggleLock = useCallback(() => {
    setDrawingState(prev => ({ ...prev, locked: !prev.locked }));
    showUI();
  }, [showUI]);

  const toggleTracing = useCallback(() => {
    setDrawingState(prev => ({ ...prev, tracingMode: !prev.tracingMode }));
    showUI();
  }, [showUI]);

  const exitTracing = useCallback(() => {
    setDrawingState(prev => ({ ...prev, tracingMode: false }));
    forceShow();
  }, [forceShow]);

  const resetTransform = useCallback(() => {
    setDrawingState(prev => ({ ...prev, scale: 1, rotation: 0, position: { x: 0, y: 0 } }));
    showUI();
  }, [showUI]);

  const handleOpenFile = useCallback(() => fileInputRef.current?.click(), []);

  const handleToggleUI = useCallback(() => {
    if (isTracingMode) return;
    setUiManuallyHidden(prev => {
      if (prev) { showUI(); return false; }
      return true;
    });
  }, [isTracingMode, showUI]);

  const handleCloseImage = useCallback(() => {
    clearImage();
    setDrawingState(prev => ({ ...prev, tracingMode: false }));
    forceShow();
  }, [clearImage, forceShow]);

  const handleFile = useCallback((file: File) => {
    const ok = loadFile(file);
    if (ok) {
      forceShow();
      setUiManuallyHidden(false);
      setDrawingState(prev => ({ ...prev, tracingMode: false }));
    }
  }, [loadFile, forceShow]);

  const handleCameraToggle = useCallback(() => {
    if (cameraState.active) {
      stopCamera();
    } else {
      startCamera('environment');
      forceShow();
      setUiManuallyHidden(false);
    }
  }, [cameraState.active, startCamera, stopCamera, forceShow]);

  useKeyboardShortcuts({
    onLock: toggleLock,
    onFullscreen: toggleFullscreen,
    onReset: resetTransform,
    onExitTracing: exitTracing,
    onOpenFile: handleOpenFile,
    onToggleUI: handleToggleUI,
    onCameraToggle: handleCameraToggle,
    tracingMode: isTracingMode,
  });

  const effectiveUIVisible = uiVisible && !uiManuallyHidden && !isTracingMode;

  const handleInteraction = useCallback(() => {
    if (!isTracingMode) showUI();
  }, [showUI, isTracingMode]);

  const showUploader = !hasContent;

  return (
    <div
      className="fixed inset-0 bg-surface-0 overflow-hidden no-select"
      onMouseMove={handleInteraction}
    >
      {/* Dot grid background when empty */}
      {showUploader && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      )}

      {/* Camera layer — always below image */}
      <CameraBackground
        videoRef={videoRef}
        active={cameraState.active}
        facing={cameraState.facing}
      />

      {/* Welcome / upload screen — only when no camera and no image */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ImageUploader
              onFile={handleFile}
              onOpenFile={handleOpenFile}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image overlay — above camera */}
      {hasImage && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <ImageCanvas
            state={{ ...drawingState, image: imageUrl }}
            onPositionChange={setPosition}
            onScaleChange={setScale}
            onRotationChange={setRotation}
            onShowUI={handleInteraction}
          />
        </div>
      )}

      {/* Camera-only state: show prompt to import image */}
      <AnimatePresence>
        {cameraState.active && !hasImage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="glass px-4 py-2 rounded-2xl text-xs text-[#8080a8] flex items-center gap-2">
              <Camera size={13} className="text-accent" />
              Camera active — import an image to overlay it
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI overlay */}
      <AnimatePresence>
        {effectiveUIVisible && hasContent && (
          <motion.div
            key="ui-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 2 }}
          >
            {/* Control panel — only when image is loaded */}
            {hasImage && (
              <div className="absolute top-4 right-4 pointer-events-auto">
                <ControlPanel
                  state={drawingState}
                  onOpacityChange={setOpacity}
                  onBlurChange={setBlur}
                  onScaleChange={setScale}
                  onRotationChange={setRotation}
                  onReset={resetTransform}
                />
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
              <Toolbar
                hasImage={hasImage}
                locked={drawingState.locked}
                tracingMode={drawingState.tracingMode}
                isFullscreen={isFullscreen}
                showHelp={showHelp}
                cameraActive={cameraState.active}
                cameraSupported={cameraState.supported}
                onUpload={handleOpenFile}
                onLock={toggleLock}
                onTracing={toggleTracing}
                onFullscreen={toggleFullscreen}
                onHelp={() => setShowHelp(v => !v)}
                onClose={handleCloseImage}
                onCameraToggle={handleCameraToggle}
                onCameraFlip={toggleFacing}
              />
            </div>

            {/* Locked badge */}
            <AnimatePresence>
              {drawingState.locked && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-[11px] font-medium text-[#a0a0c8] pointer-events-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Locked
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar when no content (welcome screen) */}
      {showUploader && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ zIndex: 2 }}>
          <Toolbar
            hasImage={false}
            locked={false}
            tracingMode={false}
            isFullscreen={isFullscreen}
            showHelp={showHelp}
            cameraActive={cameraState.active}
            cameraSupported={cameraState.supported}
            onUpload={handleOpenFile}
            onLock={toggleLock}
            onTracing={toggleTracing}
            onFullscreen={toggleFullscreen}
            onHelp={() => setShowHelp(v => !v)}
            onClose={handleCloseImage}
            onCameraToggle={handleCameraToggle}
            onCameraFlip={toggleFacing}
          />
        </div>
      )}

      {/* Tracing mode hint */}
      <AnimatePresence>
        {isTracingMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 2 }}
          >
            <div className="glass px-4 py-2 rounded-2xl text-xs text-[#6060a0] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Tracing mode —
              <kbd className="font-mono text-[#8080b0]">Esc</kbd>
              to exit
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <NotificationToast notification={notification} />
      </div>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Hidden file input when image is active */}
      {hasImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
          aria-label="File input"
        />
      )}
    </div>
  );
}
