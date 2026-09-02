import { useCallback } from 'react';
import { PersistableSettings, DEFAULT_PERSISTABLE } from '../types/drawing';

const STORAGE_KEY = 'drawing-overlay-settings';

export function usePersistentSettings() {
  const load = useCallback((): PersistableSettings => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PERSISTABLE;
      const parsed = JSON.parse(raw) as Partial<PersistableSettings>;
      return {
        opacity: parsed.opacity ?? DEFAULT_PERSISTABLE.opacity,
        blur: parsed.blur ?? DEFAULT_PERSISTABLE.blur,
        scale: parsed.scale ?? DEFAULT_PERSISTABLE.scale,
        rotation: parsed.rotation ?? DEFAULT_PERSISTABLE.rotation,
        position: parsed.position ?? DEFAULT_PERSISTABLE.position,
        locked: parsed.locked ?? DEFAULT_PERSISTABLE.locked,
      };
    } catch {
      return DEFAULT_PERSISTABLE;
    }
  }, []);

  const save = useCallback((settings: PersistableSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Quota exceeded or private browsing – silently ignore
    }
  }, []);

  return { load, save };
}
