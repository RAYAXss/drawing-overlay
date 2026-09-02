import { useEffect } from 'react';

interface ShortcutHandlers {
  onLock: () => void;
  onFullscreen: () => void;
  onReset: () => void;
  onExitTracing: () => void;
  onOpenFile: () => void;
  onToggleUI: () => void;
  onCameraToggle: () => void;
  tracingMode: boolean;
}

function isInputActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
    (el as HTMLElement).isContentEditable;
}

export function useKeyboardShortcuts({
  onLock,
  onFullscreen,
  onReset,
  onExitTracing,
  onOpenFile,
  onToggleUI,
  onCameraToggle,
  tracingMode,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tracingMode) {
        e.preventDefault();
        onExitTracing();
        return;
      }

      if (isInputActive()) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        onOpenFile();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          onLock();
          break;
        case 'f':
          e.preventDefault();
          onFullscreen();
          break;
        case 'r':
          e.preventDefault();
          onReset();
          break;
        case 'c':
          e.preventDefault();
          onCameraToggle();
          break;
        case ' ':
          e.preventDefault();
          onToggleUI();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onLock, onFullscreen, onReset, onExitTracing, onOpenFile, onToggleUI, onCameraToggle, tracingMode]);
}
