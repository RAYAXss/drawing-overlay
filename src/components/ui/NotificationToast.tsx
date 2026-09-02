import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Notification } from '../../types/drawing';

interface Props {
  notification: Notification | null;
}

const icons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

const colors = {
  error: 'text-[#a8442e]',
  success: 'text-[#4a7c4a]',
  info: 'text-ink-soft',
};

const iconColors = {
  error: 'text-[#c25a3f]',
  success: 'text-[#5a9a5a]',
  info: 'text-accent',
};

export function NotificationToast({ notification }: Props) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`
            glass flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium
            ${colors[notification.type]}
          `}
        >
          {(() => {
            const Icon = icons[notification.type];
            return <Icon size={15} className={`shrink-0 ${iconColors[notification.type]}`} />;
          })()}
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
