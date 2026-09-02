export interface Position {
  x: number;
  y: number;
}

export interface DrawingState {
  image: string | null;
  opacity: number;
  blur: number;
  scale: number;
  rotation: number;
  position: Position;
  locked: boolean;
  tracingMode: boolean;
  fullscreen: boolean;
}

export interface PersistableSettings {
  opacity: number;
  blur: number;
  scale: number;
  rotation: number;
  position: Position;
  locked: boolean;
}

export const DEFAULT_STATE: DrawingState = {
  image: null,
  opacity: 55,
  blur: 2,
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
  locked: false,
  tracingMode: false,
  fullscreen: false,
};

export const DEFAULT_PERSISTABLE: PersistableSettings = {
  opacity: 55,
  blur: 2,
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
  locked: false,
};

export type NotificationType = 'error' | 'info' | 'success';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
