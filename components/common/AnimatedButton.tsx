import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

const AnimatedButton = ({ children, loading, loadingText, ...props }: AnimatedButtonProps) => (
  <button {...props}>
    {loading ? (loadingText || 'Loading...') : children}
  </button>
);

export default AnimatedButton;
