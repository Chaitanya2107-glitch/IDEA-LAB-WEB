import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressBar: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show progress on route change
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="progress-bar"
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            background: '#f37021', // Primary Orange
            zIndex: 9999,
            boxShadow: '0 0 10px rgba(243, 112, 33, 0.5)'
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default ProgressBar;
