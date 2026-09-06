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

/** What the current camera track can actually do. */
export interface CameraCapabilities {
  /** Native optical/digital zoom via track constraints. */
  nativeZoom: boolean;
  zoomMin: number;
  zoomMax: number;
  zoomStep: number;
  /** Whether focus mode can be constrained (manual/continuous). */
  focusControl: boolean;
  /**
   * A wide-angle (<1x) view is reachable, either because native zoom goes
   * below 1x on the current track, or because a separate ultra-wide rear
   * camera was detected and can be switched to.
   */
  wideAngle: boolean;
}

export interface CameraState {
  active: boolean;
  facing: CameraFacing;
  error: CameraError | null;
  supported: boolean;
  /** Effective zoom factor applied (native, device-switch, or CSS). 1 = none. */
  zoom: number;
  /** True when focus is locked (manual) to avoid refocus hunting. */
  focusLocked: boolean;
  capabilities: CameraCapabilities;
}

/** Discrete zoom presets exposed in the UI. */
export const ZOOM_PRESETS = [0.5, 1, 2] as const;

const DEFAULT_CAPS: CameraCapabilities = {
  nativeZoom: false,
  zoomMin: 1,
  zoomMax: 1,
  zoomStep: 0.1,
  focusControl: false,
  wideAngle: false,
};

// A track's capabilities/settings expose vendor fields not yet in the DOM lib.
type ExtendedCapabilities = MediaTrackCapabilities & {
  zoom?: { min: number; max: number; step: number };
  focusMode?: string[];
  focusDistance?: { min: number; max: number; step: number };
  torch?: boolean;
};

type ExtendedConstraintSet = MediaTrackConstraintSet & {
  zoom?: number;
  focusMode?: string;
  focusDistance?: number;
};

/**
 * Which rear camera to prefer. `main` is the default/standard lens, `wide` is
 * the ultra-wide lens used to emulate a 0.5x zoom-out on devices that expose
 * it as a distinct camera (common on Android; iOS Safari usually does not).
 */
type RearLens = 'main' | 'wide';

interface RearCamera {
  deviceId: string;
  label: string;
}

/** Keywords that hint a camera is the ultra-wide lens, across locales. */
const WIDE_HINTS = [
  'ultra wide',
  'ultra-wide',
  'ultrawide',
  'ultra grand',
  'grand angle',
  'grand-angle',
  'wide angle',
  'wide-angle',
  '0.5',
  'weitwinkel',
  'gran angular',
];

const TELE_HINTS = ['tele', 'télé', 'zoom'];
const BACK_HINTS = ['back', 'rear', 'environment', 'arrière', 'arriere', 'trasera', 'rück'];

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

function labelMatches(label: string, hints: string[]): boolean {
  const l = label.toLowerCase();
  return hints.some(h => l.includes(h));
}

/**
 * Enumerate rear-facing cameras and pick out the main and ultra-wide lenses.
 * Labels are only populated after camera permission has been granted, so this
 * is called after the first successful getUserMedia. Everything is best-effort:
 * on failure or empty labels we simply report nothing found.
 */
async function discoverRearCameras(): Promise<{
  main: RearCamera | null;
  wide: RearCamera | null;
}> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
    return { main: null, wide: null };
  }

  let devices: MediaDeviceInfo[] = [];
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch {
    return { main: null, wide: null };
  }

  const cams = devices.filter(d => d.kind === 'videoinput' && d.deviceId);
  if (cams.length === 0) return { main: null, wide: null };

  // Prefer cameras that look rear-facing; if none are labelled, fall back to all.
  const labelled = cams.filter(c => c.label);
  const rear = labelled.filter(
    c => labelMatches(c.label, BACK_HINTS) && !labelMatches(c.label, ['front', 'user', 'face', 'selfie'])
  );
  const pool = rear.length > 0 ? rear : labelled.length > 0 ? labelled : cams;

  const wide = pool.find(c => c.label && labelMatches(c.label, WIDE_HINTS)) ?? null;

  // Main lens: a rear camera that is neither the wide nor an obvious tele.
  const main =
    pool.find(
      c =>
        c.deviceId !== wide?.deviceId &&
        !(c.label && labelMatches(c.label, WIDE_HINTS)) &&
        !(c.label && labelMatches(c.label, TELE_HINTS))
    ) ??
    pool.find(c => c.deviceId !== wide?.deviceId) ??
    pool[0] ??
    null;

  return {
    main: main ? { deviceId: main.deviceId, label: main.label } : null,
    wide: wide ? { deviceId: wide.deviceId, label: wide.label } : null,
  };
}

function readCapabilities(track: MediaStreamTrack, wideAvailable: boolean): CameraCapabilities {
  const caps = (typeof track.getCapabilities === 'function'
    ? track.getCapabilities()
    : {}) as ExtendedCapabilities;

  const zoom = caps.zoom;
  const focusModes = caps.focusMode ?? [];
  const nativeZoom = !!zoom && typeof zoom.max === 'number' && zoom.max > (zoom.min ?? 1);
  const zoomMin = zoom?.min ?? 1;

  return {
    nativeZoom,
    zoomMin,
    zoomMax: zoom?.max ?? 1,
    zoomStep: zoom?.step && zoom.step > 0 ? zoom.step : 0.1,
    focusControl:
      focusModes.includes('manual') || focusModes.includes('continuous'),
    // Wide-angle is reachable if the sensor zooms below 1x OR a dedicated
    // ultra-wide camera exists to switch to.
    wideAngle: wideAvailable || (nativeZoom && zoomMin < 1),
  };
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  // Discovered rear lenses (populated after first grant) and which one is live.
  const rearCamsRef = useRef<{ main: RearCamera | null; wide: RearCamera | null }>({
    main: null,
    wide: null,
  });
  const currentLensRef = useRef<RearLens>('main');
  const facingRef = useRef<CameraFacing>('environment');

  const [state, setState] = useState<CameraState>({
    active: false,
    facing: 'environment',
    error: null,
    supported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    zoom: 1,
    focusLocked: false,
    capabilities: DEFAULT_CAPS,
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /**
   * Open a stream. `deviceId`, when provided, targets a specific lens; otherwise
   * we constrain by facingMode. Returns the live video track or null on failure.
   * Errors are surfaced by the caller so we can attempt graceful fallbacks.
   */
  const openStream = useCallback(async (opts: {
    facing: CameraFacing;
    deviceId?: string;
  }): Promise<MediaStreamTrack> => {
    stopStream();

    const dims = { width: { ideal: 1920 }, height: { ideal: 1080 } };

    let stream: MediaStream;
    if (opts.deviceId) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: opts.deviceId }, ...dims },
        audio: false,
      });
    } else if (opts.facing === 'environment') {
      // Be insistent about the rear camera: first demand it strictly, then
      // relax to a preference if the device can't honor an exact match.
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' }, ...dims },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, ...dims },
          audio: false,
        });
      }
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: opts.facing }, ...dims },
        audio: false,
      });
    }

    streamRef.current = stream;
    const track = stream.getVideoTracks()[0] ?? null;
    trackRef.current = track;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {/* autoplay race — non-fatal */});
    }

    if (!track) throw new Error('No video track');
    return track;
  }, [stopStream]);

  const start = useCallback(async (facing: CameraFacing = 'environment') => {
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
      facingRef.current = facing;
      currentLensRef.current = 'main';
      const track = await openStream({ facing });

      // Discover the rear lens set now that labels are available (rear only).
      if (facing === 'environment') {
        rearCamsRef.current = await discoverRearCameras();
      } else {
        rearCamsRef.current = { main: null, wide: null };
      }

      const wideAvailable = facing === 'environment' && !!rearCamsRef.current.wide;
      const capabilities = readCapabilities(track, wideAvailable);

      setState({
        active: true,
        facing,
        error: null,
        supported: true,
        zoom: 1,
        focusLocked: false,
        capabilities,
      });
    } catch (err) {
      setState(prev => ({ ...prev, active: false, error: classifyError(err) }));
      stopStream();
    }
  }, [openStream, stopStream]);

  const stop = useCallback(() => {
    stopStream();
    setState(prev => ({ ...prev, active: false, error: null, zoom: 1, focusLocked: false }));
  }, [stopStream]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const toggleFacing = useCallback(async () => {
    const next: CameraFacing = state.facing === 'environment' ? 'user' : 'environment';
    await start(next);
  }, [state.facing, start]);

  /**
   * Switch the active rear lens (main <-> wide) by reopening the stream on the
   * target deviceId. Best-effort: if the switch fails, we restore the previous
   * lens so the camera never ends up dead.
   */
  const switchRearLens = useCallback(async (lens: RearLens): Promise<boolean> => {
    const target = lens === 'wide' ? rearCamsRef.current.wide : rearCamsRef.current.main;
    if (!target) return false;
    if (currentLensRef.current === lens && trackRef.current) return true;

    const previousLens = currentLensRef.current;
    try {
      const track = await openStream({ facing: 'environment', deviceId: target.deviceId });
      currentLensRef.current = lens;
      const capabilities = readCapabilities(track, !!rearCamsRef.current.wide);
      setState(prev => ({ ...prev, capabilities, focusLocked: false }));
      return true;
    } catch {
      // Roll back to whatever lens we had.
      const fallback =
        previousLens === 'wide' ? rearCamsRef.current.wide : rearCamsRef.current.main;
      try {
        if (fallback) {
          await openStream({ facing: 'environment', deviceId: fallback.deviceId });
        } else {
          await openStream({ facing: 'environment' });
        }
        currentLensRef.current = previousLens;
      } catch {
        // Leave error surfaced by caller.
      }
      return false;
    }
  }, [openStream]);

  /**
   * Set the zoom factor with graceful degradation:
   *  1. Native sensor zoom via applyConstraints (best — real optical/digital).
   *  2. For <1x when no native sub-1x zoom: switch to the ultra-wide lens.
   *  3. CSS digital zoom (handled by the video element) for >1x fallback.
   * Any failing step falls through to the next so we never throw at the UI.
   */
  const setZoom = useCallback(async (factor: number) => {
    const track = trackRef.current;
    const caps = state.capabilities;

    // --- Wide-angle request (factor < 1) ---
    if (factor < 1) {
      // Native sub-1x zoom on the current lens?
      if (track && caps.nativeZoom && caps.zoomMin <= factor) {
        try {
          await track.applyConstraints({ advanced: [{ zoom: factor } as ExtendedConstraintSet] });
          setState(prev => ({ ...prev, zoom: factor }));
          return;
        } catch {
          // fall through to lens switch
        }
      }
      // Dedicated ultra-wide camera?
      if (rearCamsRef.current.wide) {
        const ok = await switchRearLens('wide');
        if (ok) {
          setState(prev => ({ ...prev, zoom: factor }));
          return;
        }
      }
      // No real way to widen the field of view — clamp to 1x rather than
      // pretending (CSS can't add FOV). Ensure we're on the main lens.
      if (currentLensRef.current === 'wide') await switchRearLens('main');
      setState(prev => ({ ...prev, zoom: 1 }));
      return;
    }

    // --- Standard / tele request (factor >= 1) ---
    // If we were on the ultra-wide lens, return to the main lens first.
    if (currentLensRef.current === 'wide') {
      await switchRearLens('main');
    }

    const liveTrack = trackRef.current;
    const liveCaps = liveTrack ? readCapabilities(liveTrack, !!rearCamsRef.current.wide) : caps;

    if (liveTrack && liveCaps.nativeZoom) {
      const target = Math.min(Math.max(factor, liveCaps.zoomMin), liveCaps.zoomMax);
      try {
        await liveTrack.applyConstraints({ advanced: [{ zoom: target } as ExtendedConstraintSet] });
        setState(prev => ({ ...prev, zoom: factor }));
        return;
      } catch {
        // fall through to CSS zoom
      }
    }

    // CSS digital zoom fallback (applied by CameraBackground for factor > 1).
    setState(prev => ({ ...prev, zoom: factor }));
  }, [state.capabilities, switchRearLens]);

  /**
   * Lock or unlock autofocus. Locking sets focusMode to `manual` (or freezes
   * `continuous`) so passing a hand or object over the sheet won't trigger a
   * refocus and blur the reference.
   */
  const setFocusLock = useCallback(async (locked: boolean) => {
    const track = trackRef.current;
    if (!track || !state.capabilities.focusControl) {
      setState(prev => ({ ...prev, focusLocked: locked }));
      return;
    }

    const rawCaps = (typeof track.getCapabilities === 'function'
      ? track.getCapabilities()
      : {}) as ExtendedCapabilities;
    const modes = rawCaps.focusMode ?? [];

    try {
      if (locked && modes.includes('manual')) {
        const constraint: ExtendedConstraintSet = { focusMode: 'manual' };
        // Freeze at the current focus distance when the device reports it.
        const current = (track.getSettings() as ExtendedConstraintSet).focusDistance;
        if (typeof current === 'number') constraint.focusDistance = current;
        await track.applyConstraints({ advanced: [constraint] });
      } else if (!locked && modes.includes('continuous')) {
        await track.applyConstraints({
          advanced: [{ focusMode: 'continuous' } as ExtendedConstraintSet],
        });
      }
      setState(prev => ({ ...prev, focusLocked: locked }));
    } catch {
      // If the device rejects the constraint, still reflect intent in UI.
      setState(prev => ({ ...prev, focusLocked: locked }));
    }
  }, [state.capabilities]);

  const toggleFocusLock = useCallback(() => {
    setFocusLock(!state.focusLocked);
  }, [setFocusLock, state.focusLocked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    videoRef,
    state,
    start,
    stop,
    toggleFacing,
    clearError,
    setZoom,
    setFocusLock,
    toggleFocusLock,
  };
}
