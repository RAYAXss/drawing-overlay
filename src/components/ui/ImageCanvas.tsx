import React, { useRef, useCallback, useEffect } from 'react';
import { DrawingState, Position } from '../../types/drawing';
import { clamp } from '../../utils/image';

interface Props {
  state: DrawingState;
  onPositionChange: (pos: Position) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onShowUI: () => void;
}

interface PointerData {
  id: number;
  x: number;
  y: number;
}

export function ImageCanvas({
  state,
  onPositionChange,
  onScaleChange,
  onRotationChange,
  onShowUI,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointers = useRef<Map<number, PointerData>>(new Map());
  const lastSinglePos = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchAngle = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const getAngle = (p1: PointerData, p2: PointerData) =>
    Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

  const getDistance = (p1: PointerData, p2: PointerData) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });
    onShowUI();

    if (pointers.current.size === 1 && !stateRef.current.locked) {
      lastSinglePos.current = { x: e.clientX, y: e.clientY };
    }
    if (pointers.current.size === 2) {
      lastSinglePos.current = null;
      const pts = Array.from(pointers.current.values());
      lastPinchDist.current = getDistance(pts[0], pts[1]);
      lastPinchAngle.current = getAngle(pts[0], pts[1]);
    }
  }, [onShowUI]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const existing = pointers.current.get(e.pointerId);
    if (!existing) return;

    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });

    const { locked } = stateRef.current;

    if (pointers.current.size === 1 && !locked && lastSinglePos.current) {
      const dx = e.clientX - lastSinglePos.current.x;
      const dy = e.clientY - lastSinglePos.current.y;
      lastSinglePos.current = { x: e.clientX, y: e.clientY };
      onPositionChange({
        x: stateRef.current.position.x + dx,
        y: stateRef.current.position.y + dy,
      });
    } else if (pointers.current.size === 2 && !locked) {
      const pts = Array.from(pointers.current.values());
      const dist = getDistance(pts[0], pts[1]);
      const angle = getAngle(pts[0], pts[1]);

      if (lastPinchDist.current !== null) {
        const scaleFactor = dist / lastPinchDist.current;
        const newScale = clamp(stateRef.current.scale * scaleFactor, 0.25, 3);
        onScaleChange(newScale);
      }

      if (lastPinchAngle.current !== null) {
        const angleDelta = angle - lastPinchAngle.current;
        const newRot = stateRef.current.rotation + angleDelta;
        const clamped = ((newRot % 360) + 360) % 360;
        const normalized = clamped > 180 ? clamped - 360 : clamped;
        onRotationChange(normalized);
      }

      lastPinchDist.current = dist;
      lastPinchAngle.current = angle;
    }
  }, [onPositionChange, onScaleChange, onRotationChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      lastPinchDist.current = null;
      lastPinchAngle.current = null;
    }
    if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0];
      lastSinglePos.current = { x: remaining.x, y: remaining.y };
    }
    if (pointers.current.size === 0) {
      lastSinglePos.current = null;
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (stateRef.current.locked) return;
    const factor = e.deltaY < 0 ? 1.08 : 0.93;
    onScaleChange(clamp(stateRef.current.scale * factor, 0.25, 3));
    onShowUI();
  }, [onScaleChange, onShowUI]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const { image, opacity, blur, scale, rotation, position } = state;
  if (!image) return null;

  const transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale}) rotate(${rotation}deg)`;

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden no-select touch-none"
      style={{ cursor: state.locked ? 'default' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <img
          src={image}
          alt="Drawing reference"
          draggable={false}
          style={{
            transform,
            opacity: opacity / 100,
            filter: blur > 0 ? `blur(${blur}px)` : 'none',
            maxWidth: '100vw',
            maxHeight: '100vh',
            objectFit: 'contain',
            willChange: 'transform',
            transition: 'opacity 0.15s ease, filter 0.15s ease',
          }}
        />
      </div>
    </div>
  );
}
