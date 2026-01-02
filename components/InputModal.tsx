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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {/* Input or Select */}
        {options.length > 0 ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
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
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
