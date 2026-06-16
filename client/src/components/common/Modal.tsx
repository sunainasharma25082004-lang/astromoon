import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden z-[101]`}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                {showClose && (
                  <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-6 max-h-[80vh] overflow-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
