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
          bg: 'bg-green-50 border-green-500',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-500',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-500',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          text: 'text-orange-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-500',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          text: 'text-blue-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${styles.bg} border-l-4 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px] max-w-md`}>
        {styles.icon}
        <p className={`flex-1 font-medium ${styles.text}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
