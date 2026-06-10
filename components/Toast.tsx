import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function Toast({
  isOpen,
  onClose,
  message,
  type = 'success',
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50/90 backdrop-blur border-green-200',
          icon: <CheckCircle className="w-5 h-5 text-green-600 animate-in zoom-in-50" />,
          text: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50/90 backdrop-blur border-red-200',
          icon: <XCircle className="w-5 h-5 text-red-600 animate-in zoom-in-50" />,
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50/90 backdrop-blur border-orange-200',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600 animate-in zoom-in-50" />,
          text: 'text-orange-800'
        };
      case 'info':
        return {
          bg: 'bg-brand-50/90 backdrop-blur border-brand-200',
          icon: <Info className="w-5 h-5 text-brand-700 animate-in zoom-in-50" />,
          text: 'text-brand-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 sm:slide-in-from-right-4 duration-300">
      <div className={`${styles.bg} flex min-w-[320px] max-w-md items-center gap-3 rounded-2xl border p-4 shadow-card`}>
        {styles.icon}
        <p className={`flex-1 font-medium text-sm ${styles.text}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity p-0.5 rounded-lg`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
