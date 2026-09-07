import type React from 'react';
import { CameraFacing, CameraCapabilities } from '../../hooks/useCamera';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  facing: CameraFacing;
  zoom: number;
  capabilities: CameraCapabilities;
}

export function CameraBackground({ videoRef, active, facing, zoom, capabilities }: Props) {
  // NOTE: the <video> is ALWAYS mounted (even when inactive) so the stream-
  // binding effect in useCamera always has an element to attach to. Hiding it
  // via opacity/visibility avoids the first-start black screen that happened
  // when the element was conditionally unmounted.

  // When the device handles zoom natively, the pixels are already zoomed by
  // the sensor — don't double-apply. Otherwise emulate zoom with a CSS scale.
  // For wide-angle (<1) without native support, CSS can't add field of view,
  // so we clamp the visual scale to a minimum of 1 to avoid empty borders.
  const cssZoom = capabilities.nativeZoom ? 1 : Math.max(zoom, 1);
  const mirror = facing === 'user' ? -1 : 1;

  return (
    <video
      ref={videoRef as React.RefObject<HTMLVideoElement>}
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
        transform: `scaleX(${mirror}) scale(${cssZoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease, opacity 0.25s ease',
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        visibility: active ? 'visible' : 'hidden',
        backgroundColor: '#000',
        zIndex: 0,
      }}
    />
  );
}
