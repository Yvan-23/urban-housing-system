import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }) => (
  <div className={cn("bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6 shadow-soft", className)}>
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }) => {
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg",
    secondary: "bg-secondary-200 text-secondary-800 hover:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-200 dark:hover:bg-secondary-700",
    outline: "border border-secondary-300 text-secondary-700 hover:bg-secondary-50 dark:border-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-800",
    ghost: "text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800"
  };

  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: "bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};
