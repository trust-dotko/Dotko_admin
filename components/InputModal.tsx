import { useState } from 'react';
import { X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  options?: string[];
}

export default function InputModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  options = []
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
    setValue(defaultValue);
  };

  const handleClose = () => {
    onClose();
    setValue(defaultValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md animate-in zoom-in rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="mb-4 text-slate-600">
          {message}
        </p>

        {/* Input or Select */}
        {options.length > 0 ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="admin-select mb-6 w-full"
            autoFocus
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').charAt(0).toUpperCase() + option.replace(/_/g, ' ').slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="admin-input mb-6"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
