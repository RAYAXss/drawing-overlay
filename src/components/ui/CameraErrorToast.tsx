import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraOff, RotateCw, ChevronDown, X } from 'lucide-react';
import { CameraError } from '../../hooks/useCamera';

interface Props {
  error: CameraError | null;
  onRetry: () => void;
  onDismiss: () => void;
}

/** Detects the platform to show the most relevant re-authorization steps. */
function detectPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

interface Guide {
  title: string;
  steps: string[];
}

function buildGuide(error: CameraError): Guide {
  const platform = detectPlatform();

  if (error.kind === 'insecure') {
    return {
      title: 'Secure connection required',
      steps: [
        'The camera only works over HTTPS.',
        'Open this site with an https:// address.',
        'On localhost it works during development.',
      ],
    };
  }

  if (error.kind === 'notfound') {
    return {
      title: 'No camera detected',
      steps: [
        'Make sure a camera is connected and enabled.',
        'Close other apps that may be using it.',
        'Then tap Retry.',
      ],
    };
  }

  if (error.kind === 'inuse') {
    return {
      title: 'Camera is busy',
      steps: [
        'Another app is currently using the camera.',
        'Close it (video call, other camera app…).',
        'Then tap Retry.',
      ],
    };
  }

  // denied / unknown → re-authorization instructions per platform
  if (platform === 'ios') {
    return {
      title: 'Allow camera on iPhone',
      steps: [
        'Open the Settings app.',
        'Scroll to Safari, then tap Camera.',
        'Choose Allow, or set this site to Ask.',
        'Return here and tap Retry.',
      ],
    };
  }

  if (platform === 'android') {
    return {
      title: 'Allow camera on Android',
      steps: [
        'Tap the lock icon in the address bar.',
        'Open Permissions and enable Camera.',
        'Reload the page, then tap Retry.',
      ],
    };
  }

  return {
    title: 'Allow camera',
    steps: [
      'Click the camera or lock icon in the address bar.',
      'Set Camera to Allow.',
      'Then tap Retry.',
    ],
  };
}

export function CameraErrorToast({ error, onRetry, onDismiss }: Props) {
  const [expanded, setExpanded] = useState(false);

  const guide = useMemo(() => (error ? buildGuide(error) : null), [error]);

  return (
    <AnimatePresence>
      {error && guide && (
        <motion.div
          key={error.kind + error.message}
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="glass w-[min(88vw,360px)] rounded-3xl p-4 text-ink pointer-events-auto"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 shrink-0 rounded-2xl glass-btn flex items-center justify-center">
              <CameraOff size={18} className="text-accent-hover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{guide.title}</p>
              <p className="text-xs text-ink-soft mt-0.5 leading-snug">{error.message}</p>
            </div>

            <button
              onClick={onDismiss}
              aria-label="Dismiss"
              className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-ink-faint hover:text-ink hover:bg-white/50 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Expandable help steps */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 w-full flex items-center justify-between text-xs font-medium text-ink-soft hover:text-ink transition-colors"
            aria-expanded={expanded}
          >
            <span>How to fix</span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={15} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.ol
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden mt-2 space-y-1.5"
              >
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-ink-soft leading-snug">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-accent-muted text-accent-hover text-[10px] font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            className="mt-3 w-full h-11 rounded-2xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:brightness-105"
            style={{
              background: 'linear-gradient(180deg, #B7A88E 0%, #8C7A62 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 3px rgba(80,64,40,0.3), 0 6px 16px -6px rgba(120,100,70,0.45)',
            }}
          >
            <RotateCw size={15} />
            Retry
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
