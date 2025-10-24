import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-6 h-6 text-[#FF5A00]" />,
  error: <XCircle className="w-6 h-6 text-[#FF5A00]" />,
  info: <Info className="w-6 h-6 text-[#FF5A00]" />,
};

const bgColors = {
  success: 'bg-[#FFF4EE] border-[#FF5A00]',
  error: 'bg-[#FFF4EE] border-[#FF5A00]',
  info: 'bg-[#FFF4EE] border-[#FF5A00]',
};

const Notification = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-xl shadow-md px-5 py-4 border ${bgColors[type]} flex items-center gap-3`}
        >
          {icons[type]}
          <p className="text-sm font-medium text-gray-800">{message}</p>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
