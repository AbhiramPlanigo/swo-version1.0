import React from 'react';

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  hoverEffect = false,
  glass = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const glassClass = glass 
    ? 'glass-card text-[#1D1D1F] dark:text-white shadow-xs border border-white/70 dark:border-white/10' 
    : 'bg-white dark:bg-[#141A26] border border-[#E2E8F0] dark:border-white/10 shadow-xs text-[#1D1D1F] dark:text-white';

  const hoverClass = hoverEffect
    ? 'transition-transform duration-200 ease-out transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#CBD5E1] dark:hover:border-white/20'
    : '';

  return (
    <div
      className={`rounded-[24px] ${glassClass} ${paddingMap} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
