"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWallet } from 'react-icons/fa';
import { Connector, useConnect } from 'wagmi';
import AnimatedButton from './AnimatedButton';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: readonly Connector[];
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, connectors }) => {
  const { connect } = useConnect();

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md p-6 bg-primary-light dark:bg-primary-dark rounded-2xl shadow-xl border border-black/10 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Connect Wallet</h2>
              <button
                onClick={onClose}
                className="text-text-light/70 dark:text-text-dark/70 hover:text-text-light dark:hover:text-text-dark transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {connectors.length > 0 ? (
                connectors.map((connector) => (
                  <AnimatedButton
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaWallet size={20} />
                    <span className="text-lg font-semibold">{connector.name}</span>
                  </AnimatedButton>
                ))
              ) : (
                <div className="text-center p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                  <p className="text-text-light dark:text-text-dark">No wallet connectors found.</p>
                  <p className="text-sm text-text-light/70 dark:text-text-dark/70 mt-1">
                    Please install a wallet extension like MetaMask.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;
