import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  title?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  className = '',
  showCloseButton = true,
  title,
}) => {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg ${className}`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;