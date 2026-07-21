// ponytail: Framer-motion enabled premium button component supporting multiple variants.
import React from 'react';
import { motion } from '../../utils/lazyFramer';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  className,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl text-sm px-5 py-2.5';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-accent text-primary-900 hover:bg-accent/90 focus:ring-accent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      className={cn(baseStyles, variants[variant], disabled && 'opacity-50 cursor-not-allowed', className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
