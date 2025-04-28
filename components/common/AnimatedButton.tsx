import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { AnimatedButtonProps } from "@/lib/interdace";

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  isConnect = false,
}) => {
  const baseStyles = "font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    // Updated Primary for B&W theme
    primary: "bg-gray-800 dark:bg-gray-200 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-300 focus:ring-gray-500 dark:focus:ring-gray-400",
    // Updated Secondary for B&W theme
    secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400 dark:focus:ring-gray-500",
    // Updated Outline for B&W theme
    outline: "bg-transparent border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 dark:focus:ring-gray-400",
    // Gradient remains, but check its contrast in light/dark
    gradient: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500",
  };

  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick ? () => onClick(isConnect) : undefined}
      disabled={disabled}
      className={buttonClasses.trim()}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
