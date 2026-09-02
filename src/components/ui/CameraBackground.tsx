import { useEffect } from 'react';
import { CameraFacing } from '../../hooks/useCamera';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  facing: CameraFacing;
}

export function CameraBackground({ videoRef, active, facing }: Props) {
  // Re-attach stream if video element mounts after stream is already active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.srcObject) return; // already attached
  }, [videoRef]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        // Mirror front camera only
        transform: facing === 'user' ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
