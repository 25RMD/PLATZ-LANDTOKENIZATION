'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiCheckCircle } from 'react-icons/fi';

interface MigrationNoticeProps {
  className?: string;
  dismissible?: boolean;
}

const MigrationNotice: React.FC<MigrationNoticeProps> = ({ 
  className = '', 
  dismissible = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <FiInfo className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">
                Smart Contract Upgrade Complete
              </h3>
              <FiCheckCircle className="text-green-600 dark:text-green-400" size={16} />
            </div>
            
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              We've successfully upgraded our smart contracts to fix collection counting issues. 
              Collections created after this upgrade will display the correct number of items.
            </p>
            
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p>• <strong>New Contract:</strong> 0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde</p>
              <p>• <strong>Status:</strong> Collections now show 10 items instead of 9</p>
              <p>• <strong>Legacy collections:</strong> Older collections may not be accessible on-chain</p>
            </div>
          </div>
          
          {dismissible && (
            <motion.button
              onClick={() => setIsVisible(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={20} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MigrationNotice; 