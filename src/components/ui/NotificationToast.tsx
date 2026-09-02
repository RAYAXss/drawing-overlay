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
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
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
            flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium
            backdrop-blur-md shadow-xl
            ${colors[notification.type]}
          `}
        >
          {(() => {
            const Icon = icons[notification.type];
            return <Icon size={15} className="shrink-0" />;
          })()}
          <span>{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
