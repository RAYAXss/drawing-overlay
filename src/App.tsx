import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, EyeOff } from 'lucide-react';
import { DrawingState, DEFAULT_STATE, Position } from './types/drawing';
import { useImage } from './hooks/useImage';
import { useFullscreen } from './hooks/useFullscreen';
import { useAutoHideUI } from './hooks/useAutoHideUI';
import { usePersistentSettings } from './hooks/usePersistentSettings';
import { useCamera } from './hooks/useCamera';
import { ImageUploader } from './components/ui/ImageUploader';
import { ImageCanvas } from './components/ui/ImageCanvas';
import { CameraBackground } from './components/ui/CameraBackground';
import { CameraControls } from './components/ui/CameraControls';
import { ControlPanel } from './components/ui/ControlPanel';
import { Toolbar } from './components/ui/Toolbar';
import { NotificationToast } from './components/ui/NotificationToast';
import { CameraErrorToast } from './components/ui/CameraErrorToast';
import { clamp } from './utils/image';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { imageUrl, loadFile, clearImage, notification } = useImage();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { load: loadSettings, save: saveSettings } = usePersistentSettings();
  const {
    videoRef,
    state: cameraState,
    start: startCamera,
    stop: stopCamera,
    toggleFacing,
    clearError: clearCameraError,
    setZoom: setCameraZoom,
    toggleFocusLock,
  } = useCamera();

  const [drawingState, setDrawingState] = useState<DrawingState>(() => {
    const saved = loadSettings();
    return { ...DEFAULT_STATE, ...saved };
  });

  const [uiManuallyHidden, setUiManuallyHidden] = useState(false);
  const [showControls, setShowControls] = useState(false);

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
      scale: drawingState.scale,
      rotation: drawingState.rotation,
      position: drawingState.position,
      locked: drawingState.locked,
    });
  }, [drawingState.opacity, drawingState.scale, drawingState.rotation, drawingState.position, drawingState.locked, saveSettings]);

  // --- Transform setters ---
  const setOpacity = useCallback((v: number) => setDrawingState(prev => ({ ...prev, opacity: clamp(v, 0, 100) })), []);
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

  const handleCloseImage = useCallback(() => {
    clearImage();
    setDrawingState(prev => ({ ...prev, tracingMode: false }));
    forceShow();
  }, [clearImage, forceShow]);

  const handleFile = useCallback(async (file: File) => {
    const ok = await loadFile(file);
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

  const handleCameraRetry = useCallback(() => {
    startCamera(cameraState.facing);
    forceShow();
    setUiManuallyHidden(false);
  }, [startCamera, cameraState.facing, forceShow]);

  const handleCameraZoom = useCallback((factor: number) => {
    setCameraZoom(factor);
    showUI();
  }, [setCameraZoom, showUI]);

  const handleFocusLock = useCallback(() => {
    toggleFocusLock();
    showUI();
  }, [toggleFocusLock, showUI]);

  const effectiveUIVisible = uiVisible && !uiManuallyHidden && !isTracingMode;

  const handleInteraction = useCallback(() => {
    if (!isTracingMode) showUI();
  }, [showUI, isTracingMode]);

  const showUploader = !hasContent;

  return (
    <div
      className="fixed inset-0 bg-sand-200 overflow-hidden no-select"
      onMouseMove={handleInteraction}
    >
      {/* Ruled notebook grid background when empty */}
      {showUploader && (
        <>
          {/* Fine grid — squared paper */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(140,122,98,0.08) 1px, transparent 1px),' +
                'linear-gradient(to bottom, rgba(140,122,98,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Bolder ruled lines every 5 cells */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(140,122,98,0.14) 1px, transparent 1px),' +
                'linear-gradient(to bottom, rgba(140,122,98,0.14) 1px, transparent 1px)',
              backgroundSize: '140px 140px',
            }}
          />
          {/* Margin line — like a notebook's red rule, in warm stone */}
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{
              left: 'max(32px, env(safe-area-inset-left, 0px))',
              borderLeft: '1.5px solid rgba(168,120,98,0.18)',
            }}
          />
        </>
      )}

      {/* Camera layer — always below image */}
      <CameraBackground
        videoRef={videoRef}
        active={cameraState.active}
        facing={cameraState.facing}
        zoom={cameraState.zoom}
        capabilities={cameraState.capabilities}
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
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
          >
            <div className="glass px-4 py-2.5 rounded-2xl text-xs text-ink-soft flex items-center gap-2">
              <Camera size={14} className="text-accent-hover" />
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
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 w-full max-w-[calc(100vw-24px)] px-3"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
            >
              {cameraState.active && (
                <CameraControls
                  zoom={cameraState.zoom}
                  focusLocked={cameraState.focusLocked}
                  capabilities={cameraState.capabilities}
                  onZoom={handleCameraZoom}
                  onToggleFocusLock={handleFocusLock}
                />
              )}
              <Toolbar
                hasImage={hasImage}
                locked={drawingState.locked}
                tracingMode={drawingState.tracingMode}
                isFullscreen={isFullscreen}
                cameraActive={cameraState.active}
                cameraSupported={cameraState.supported}
                onUpload={handleOpenFile}
                onLock={toggleLock}
                onTracing={toggleTracing}
                onFullscreen={toggleFullscreen}
                onClose={handleCloseImage}
                onCameraToggle={handleCameraToggle}
                onCameraFlip={toggleFacing}
                onAdjust={() => setShowControls(true)}
              />
            </div>

            {/* Locked badge */}
            <AnimatePresence>
              {drawingState.locked && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="absolute left-4 flex items-center gap-1.5 px-3 py-2 glass rounded-2xl text-[11px] font-medium text-ink-soft pointer-events-none"
                  style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
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
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ zIndex: 2, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          <Toolbar
            hasImage={false}
            locked={false}
            tracingMode={false}
            isFullscreen={isFullscreen}
            cameraActive={cameraState.active}
            cameraSupported={cameraState.supported}
            onUpload={handleOpenFile}
            onLock={toggleLock}
            onTracing={toggleTracing}
            onFullscreen={toggleFullscreen}
            onClose={handleCloseImage}
            onCameraToggle={handleCameraToggle}
            onCameraFlip={toggleFacing}
            onAdjust={() => setShowControls(true)}
          />
        </div>
      )}

      {/* Tracing mode — tappable exit button */}
      <AnimatePresence>
        {isTracingMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ zIndex: 2, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={exitTracing}
              className="glass px-5 h-[52px] rounded-2xl text-sm font-medium text-ink flex items-center gap-2.5"
            >
              <EyeOff size={18} className="text-accent-hover" />
              Exit tracing
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <NotificationToast notification={notification} />
      </div>

      {/* Camera error — guided help + retry */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <CameraErrorToast
          error={cameraState.error}
          onRetry={handleCameraRetry}
          onDismiss={clearCameraError}
        />
      </div>

      {/* Image adjustments — iOS slide-up sheet */}
      <ControlPanel
        open={showControls && hasImage}
        onClose={() => setShowControls(false)}
        state={drawingState}
        onOpacityChange={setOpacity}
        onScaleChange={setScale}
        onRotationChange={setRotation}
        onReset={resetTransform}
      />



      {/* Hidden file input — always mounted so upload works in any state
          (welcome screen, camera-only, or with an image loaded) */}
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
    </div>
  );
}
