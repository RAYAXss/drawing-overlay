import { useState, useCallback, useRef } from 'react';
import {
  isValidImageType,
  isWithinSizeLimit,
  hasValidImageSignature,
  createObjectURL,
  revokeObjectURL,
  MAX_IMAGE_BYTES,
} from '../utils/image';
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

  const loadFile = useCallback(async (file: File): Promise<boolean> => {
    if (!isValidImageType(file)) {
      showNotification('Unsupported format. Please use PNG, JPG, or WEBP.');
      return false;
    }

    if (!isWithinSizeLimit(file)) {
      const mb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));
      showNotification(`Image is too large. Maximum size is ${mb} MB.`);
      return false;
    }

    // Verify real content, not just the reported MIME type.
    const genuine = await hasValidImageSignature(file);
    if (!genuine) {
      showNotification('This file does not appear to be a valid image.');
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
