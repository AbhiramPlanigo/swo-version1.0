import React from 'react';

interface SWOLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  subtext?: string;
  className?: string;
}

export const SWOLogo: React.FC<SWOLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'dark',
  subtext = 'Bangalore Yeshwanthpur Campus',
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 30, text: 'text-xs', sub: 'text-[9px]' },
    sm: { icon: 40, text: 'text-xs font-semibold', sub: 'text-[10px]' },
    md: { icon: 48, text: 'text-sm font-bold', sub: 'text-[11px]' },
    lg: { icon: 64, text: 'text-base font-bold', sub: 'text-xs' },
    xl: { icon: 88, text: 'text-lg font-bold', sub: 'text-sm' },
    '2xl': { icon: 112, text: 'text-xl font-bold', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Circular SWO BYC Logo without border */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-full overflow-hidden transition-transform duration-200 hover:scale-105"
        style={{ width: dim.icon, height: dim.icon }}
      >
        <img
          src="/swo-byc-logo.png"
          alt="Student Welfare Office - Bangalore Yeshwanthpur Campus"
          className="w-full h-full object-contain rounded-full select-none"
          loading="eager"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('.svg')) {
              target.src = '/swo-byc-logo.svg';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`tracking-tight font-extrabold leading-tight ${dim.text} ${
                textColor === 'light' ? 'text-white' : 'text-[#0F172A] dark:text-white'
              }`}
            >
              STUDENT WELFARE OFFICE
            </span>
            <span
              className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${
                textColor === 'light'
                  ? 'bg-[#C5A063]/25 text-[#E6C98F] border-[#C5A063]/40'
                  : 'bg-[#C5A063]/15 dark:bg-[#C5A063]/20 text-[#8F6F35] dark:text-[#E2C78A] border-[#C5A063]/30 dark:border-[#C5A063]/40'
              }`}
            >
              SWO • BYC
            </span>
          </div>
          <span
            className={`font-medium tracking-tight mt-0.5 hidden xs:block sm:block ${dim.sub} ${
              textColor === 'light' ? 'text-slate-300' : 'text-[#536275] dark:text-[#94A3B8]'
            }`}
          >
            {subtext}
          </span>
          <span
            className={`font-medium tracking-tight mt-0.5 xs:hidden sm:hidden text-[9px] ${
              textColor === 'light' ? 'text-slate-300' : 'text-[#536275] dark:text-[#94A3B8]'
            }`}
          >
            Bangalore Yeshwanthpur
          </span>
        </div>
      )}
    </div>
  );
};
