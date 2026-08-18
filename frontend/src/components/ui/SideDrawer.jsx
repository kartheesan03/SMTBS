import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './SideDrawer.css';

export const SideDrawer = ({ isOpen, onClose, title, subtitle, children, width = 600 }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="drawer-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="drawer-panel"
            style={{ width: `${width}px`, maxWidth: '100vw' }}
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h2 className="drawer-title">{title}</h2>
                {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
              </div>
              <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
                <X size={20} />
              </button>
            </div>
            <div className="drawer-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
