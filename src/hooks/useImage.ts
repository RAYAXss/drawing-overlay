import { useState, useCallback, useRef } from 'react';
import { isValidImageType, createObjectURL, revokeObjectURL } from '../utils/image';
import { Notification } from '../types/drawing';

export function useImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const showNotification = useCallback((message: string, type: Notification['type'] = 'error') => {
    const id = Math.random().toString(36).slice(2);
    setNotification({ id, message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!isValidImageType(file)) {
      showNotification('Unsupported format. Please use PNG, JPG, or WEBP.');
      return false;
    }

    // Revoke previous URL
    if (currentUrlRef.current) {
      revokeObjectURL(currentUrlRef.current);
    }

    const url = createObjectURL(file);
    currentUrlRef.current = url;
    setImageUrl(url);
    return true;
  }, [showNotification]);

  const clearImage = useCallback(() => {
    if (currentUrlRef.current) {
      revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
    setImageUrl(null);
  }, []);

  return { imageUrl, loadFile, clearImage, notification, showNotification };
}
