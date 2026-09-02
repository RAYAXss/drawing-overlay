import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraFacing = 'environment' | 'user';

/** Classified reason a camera start failed, so the UI can guide the user. */
export type CameraErrorKind =
  | 'denied'        // permission refused by user / system
  | 'notfound'      // no camera hardware
  | 'inuse'         // camera busy in another app
  | 'insecure'      // not served over HTTPS / secure context
  | 'unsupported'   // getUserMedia not available
  | 'unknown';

export interface CameraError {
  kind: CameraErrorKind;
  message: string;
}

export interface CameraState {
  active: boolean;
  facing: CameraFacing;
  error: CameraError | null;
  supported: boolean;
}

function isSecure(): boolean {
  if (typeof window === 'undefined') return true;
  // localhost is treated as secure by browsers
  return window.isSecureContext === true;
}

function classifyError(err: unknown): CameraError {
  if (!isSecure()) {
    return {
      kind: 'insecure',
      message: 'Camera needs a secure (HTTPS) connection.',
    };
  }

  const name = (err as { name?: string })?.name ?? '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return { kind: 'denied', message: 'Camera access is blocked.' };
    case 'NotFoundError':
    case 'OverconstrainedError':
      return { kind: 'notfound', message: 'No camera found on this device.' };
    case 'NotReadableError':
    case 'AbortError':
      return { kind: 'inuse', message: 'Camera is in use by another app.' };
    default:
      return {
        kind: 'unknown',
        message: err instanceof Error ? err.message : 'Camera could not start.',
      };
  }
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    active: false,
    facing: 'environment',
    error: null,
    supported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const start = useCallback(async (facing: CameraFacing = 'environment') => {
    stopStream();
    setState(prev => ({ ...prev, error: null }));

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState(prev => ({
        ...prev,
        active: false,
        supported: false,
        error: { kind: isSecure() ? 'unsupported' : 'insecure', message: 'Camera is not available in this browser.' },
      }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({ active: true, facing, error: null, supported: true });
    } catch (err) {
      setState(prev => ({ ...prev, active: false, error: classifyError(err) }));
      stopStream();
    }
  }, [stopStream]);

  const stop = useCallback(() => {
    stopStream();
    setState(prev => ({ ...prev, active: false, error: null }));
  }, [stopStream]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const toggleFacing = useCallback(async () => {
    const next: CameraFacing = state.facing === 'environment' ? 'user' : 'environment';
    await start(next);
  }, [state.facing, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return { videoRef, state, start, stop, toggleFacing, clearError };
}
