// ponytail: Elegant card with soft margins, subtle primary borders, and hover micro-shadow transitions.
import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        'bg-white border border-primary-100/60 rounded-2xl shadow-[0_4px_20px_rgba(2,59,101,0.03)] hover:shadow-[0_12px_40px_rgba(2,59,101,0.06)] transition-all duration-300 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div 
      className={cn('bg-primary-50/40 border-b border-primary-100/50 py-5 px-6 flex items-center gap-3', className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('p-6 sm:p-8', className)} {...props}>
      {children}
    </div>
  );
}
