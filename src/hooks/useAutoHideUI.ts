import { useState, useEffect, useRef, useCallback } from 'react';

const HIDE_DELAY = 2500;

export function useAutoHideUI(enabled: boolean) {
  const [uiVisible, setUiVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setUiVisible(false);
    }, HIDE_DELAY);
  }, [enabled]);

  const showUI = useCallback(() => {
    setUiVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const forceShow = useCallback(() => {
    setUiVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!enabled) {
      forceShow();
      return;
    }
    scheduleHide();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, scheduleHide, forceShow]);

  return { uiVisible, showUI, forceShow };
}
