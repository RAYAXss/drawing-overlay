const ACCEPTED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

export function isValidImageType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function getDistance(touches: TouchList | PointerEvent[]): number {
  if ('length' in touches && touches.length >= 2) {
    const t = touches as TouchList;
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  }
  return 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
