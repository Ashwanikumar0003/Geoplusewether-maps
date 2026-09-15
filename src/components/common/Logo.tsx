import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  animate?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', title: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', title: 'text-xl', sub: 'text-[11px]' },
    lg: { img: 'w-14 h-14', title: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', title: 'text-3xl', sub: 'text-sm' },
    hero: { img: 'w-32 h-32', title: 'text-4xl sm:text-5xl', sub: 'text-base' },
  };

  const { img, title, sub } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${img} flex-shrink-0 flex items-center justify-center ${animate ? 'hover:scale-105 transition-transform duration-300' : ''}`}>
        <img
          src="/logo.svg"
          alt="GeoPluse"
          className="w-full h-full object-contain filter drop-shadow-md"
          loading="eager"
        />
        {animate && (
          <div className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-sm -z-10 animate-pulse" />
        )}
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-0.5">
            <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${title}`} style={{ fontFamily: 'var(--font-display)' }}>
              Geo<span className="text-cyan-500">Pluse</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5 animate-pulse" />
          </div>
          {subtitle ? (
            <span className={`text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase mt-0.5 ${sub}`}>
              {subtitle}
            </span>
          ) : (
            <span className={`text-cyan-600 dark:text-cyan-400/80 font-medium tracking-wider uppercase mt-0.5 ${sub}`}>
              Weather & Maps
            </span>
          )}
        </div>
      )}
    </div>
  );
};
