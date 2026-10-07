import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  variant = 'light',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Abstract geometric compass / faceted 'E' logo mark (NO leaf) */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden bg-gradient-to-br from-[#0047AB] via-[#003A8C] to-[#071A3F] border border-white/20`}
        aria-hidden="true"
      >
        {/* Geometric facets */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Outer compass diamond */}
          <path
            d="M18 4L32 18L18 32L4 18L18 4Z"
            fill="url(#logo_grad_1)"
            opacity="0.25"
          />
          {/* Dynamic modern 'E' path */}
          <path
            d="M11 9H25C26.1 9 27 9.9 27 11V12C27 12.6 26.6 13 26 13H15V16.5H23C23.6 16.5 24 16.9 24 17.5V18.5C24 19.1 23.6 19.5 23 19.5H15V23H26C26.6 23 27 23.4 27 24V25C27 26.1 26.1 27 25 27H11C9.9 27 9 26.1 9 25V11C9 9.9 9.9 9H11Z"
            fill="url(#logo_grad_2)"
          />
          {/* Radiant green spark dot */}
          <circle cx="27" cy="18" r="2.5" fill="#22C55E" />
          <defs>
            <linearGradient id="logo_grad_1" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22C55E" />
              <stop offset="1" stopColor="#0047AB" />
            </linearGradient>
            <linearGradient id="logo_grad_2" x1="9" y1="9" x2="27" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#EAF1FF" />
              <stop offset="1" stopColor="#22C55E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight leading-none ${textSizes[size]} ${
            isLight ? 'text-white' : 'text-[#071A3F]'
          }`}
        >
          Eco<span className="text-[#22C55E]">Quest</span>
        </span>
        {showTagline && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${
              isLight ? 'text-white/60' : 'text-[#5B6B8C]'
            }`}
          >
            Save · Spend · Grow
          </span>
        )}
      </div>
    </div>
  );
};
