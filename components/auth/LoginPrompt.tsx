'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const LoginPrompt: React.FC = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Access Restricted</h2>
      <p className="text-md text-text-light dark:text-text-dark">
        You don&apos;t have access to this page unless you{' '}
        <Link href="/login" className="text-accent-light dark:text-accent-dark underline font-medium">
          log in here
        </Link>
        .
      </p>
    </motion.div>
  );
};

export default LoginPrompt;
