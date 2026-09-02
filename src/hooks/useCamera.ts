import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraFacing = 'environment' | 'user';

export interface CameraState {
  active: boolean;
  facing: CameraFacing;
  error: string | null;
  supported: boolean;
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
      const message = err instanceof Error ? err.message : 'Camera access denied';
      setState(prev => ({ ...prev, active: false, error: message }));
      stopStream();
    }
  }, [stopStream]);

  const stop = useCallback(() => {
    stopStream();
    setState(prev => ({ ...prev, active: false, error: null }));
  }, [stopStream]);

  const toggleFacing = useCallback(async () => {
    const next: CameraFacing = state.facing === 'environment' ? 'user' : 'environment';
    await start(next);
  }, [state.facing, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return { videoRef, state, start, stop, toggleFacing };
}
