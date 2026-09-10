import React from 'react';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'navy' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  pill?: boolean;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  pill = true,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 min-h-[44px] gap-1.5 font-medium tracking-tight',
    md: 'text-sm px-4.5 py-2.5 min-h-[44px] gap-2 font-medium tracking-tight',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5 font-semibold tracking-tight',
  }[size];

  const variantClasses = {
    primary: 'bg-[#3A5982] dark:bg-[#4770A3] text-white hover:bg-[#2D476C] dark:hover:bg-[#3A5D88] active:bg-[#243956] shadow-xs hover:shadow border border-transparent',
    navy: 'bg-[#1B283A] dark:bg-[#1E293B] text-white hover:bg-[#25364D] dark:hover:bg-[#334155] border border-black/10 dark:border-white/10 shadow-xs',
    secondary: 'bg-[#F1F5F9] dark:bg-white/10 text-[#16212F] dark:text-white hover:bg-[#E2E8F0] dark:hover:bg-white/15 border border-[#CBD5E1]/70 dark:border-white/15 shadow-2xs',
    ghost: 'bg-transparent text-[#3A5982] dark:text-[#93C5FD] hover:bg-[#3A5982]/10 dark:hover:bg-white/10 border border-transparent',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/40',
    gold: 'bg-[#C5A063] text-white hover:bg-[#B28C4E] shadow-xs border border-[#C5A063]/30',
  }[variant];

  const shapeClass = pill ? 'rounded-full' : 'rounded-2xl';

  return (
    <button
      className={`inline-flex items-center justify-center select-none whitespace-nowrap cursor-pointer touch-manipulation active:scale-[0.97] transition-transform duration-100 ease-out transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${shapeClass} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
