const ACCEPTED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

/** Hard cap on imported image size to avoid memory exhaustion (25 MB). */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export function isValidImageType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

export function isWithinSizeLimit(file: File): boolean {
  return file.size > 0 && file.size <= MAX_IMAGE_BYTES;
}

/**
 * Verify a file's real content type by inspecting its magic bytes rather than
 * trusting the browser-reported MIME type (which is attacker-controllable when
 * files arrive via drag-and-drop). Returns true only for genuine PNG/JPEG/WEBP.
 */
export async function hasValidImageSignature(file: File): Promise<boolean> {
  try {
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (header.length < 4) return false;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      return true;
    }

    // JPEG: FF D8 FF
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return true;
    }

    // WEBP: "RIFF" .... "WEBP"
    if (
      header[0] === 0x52 &&
      header[1] === 0x49 &&
      header[2] === 0x46 &&
      header[3] === 0x46 &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
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
