import React from 'react';
import { CurrentWeather } from '../../types/weather';
import { AppTheme } from '../../types/app';

interface AtmosphericBackgroundProps {
  weather?: CurrentWeather | null;
  theme: AppTheme;
  enabled?: boolean;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  weather,
  theme,
  enabled = true,
}) => {
  if (!enabled) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-100 dark:bg-slate-950 transition-colors duration-500" />
    );
  }

  // Determine atmospheric profile based on condition text and icon
  const condition = (weather?.condition_text || '').toLowerCase();
  const icon = (weather?.icon_type || '').toLowerCase();
  const isNight = icon.includes('night') || icon.includes('moon');

  // Atmospheric background themes with high-quality atmospheric imagery
  let bgGradient = 'from-sky-100 via-slate-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40';
  let ambientGlow1 = 'bg-cyan-400/15 dark:bg-cyan-500/10';
  let ambientGlow2 = 'bg-blue-500/10 dark:bg-blue-600/10';
  let weatherEffect = null;

  if (condition.includes('thunder') || condition.includes('storm')) {
    bgGradient = 'from-slate-300 via-indigo-200 to-purple-200 dark:from-slate-950 dark:via-indigo-950/60 dark:to-purple-950/40';
    ambientGlow1 = 'bg-purple-500/20 dark:bg-purple-500/20';
    ambientGlow2 = 'bg-indigo-500/20 dark:bg-indigo-600/20';
    weatherEffect = 'storm';
  } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    bgGradient = 'from-slate-200 via-blue-100 to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/50';
    ambientGlow1 = 'bg-blue-400/20 dark:bg-blue-500/15';
    ambientGlow2 = 'bg-cyan-400/15 dark:bg-cyan-600/10';
    weatherEffect = 'rain';
  } else if (condition.includes('snow') || condition.includes('ice') || condition.includes('blizzard')) {
    bgGradient = 'from-slate-100 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900';
    ambientGlow1 = 'bg-cyan-200/30 dark:bg-cyan-400/10';
    ambientGlow2 = 'bg-blue-200/20 dark:bg-blue-400/10';
    weatherEffect = 'snow';
  } else if (condition.includes('cloud') || condition.includes('overcast')) {
    bgGradient = 'from-slate-200 via-slate-100 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
    ambientGlow1 = 'bg-sky-400/15 dark:bg-slate-700/20';
    ambientGlow2 = 'bg-cyan-300/15 dark:bg-blue-900/15';
    weatherEffect = 'cloud';
  } else if (isNight) {
    bgGradient = 'from-indigo-950 via-slate-900 to-slate-950 text-white';
    ambientGlow1 = 'bg-indigo-500/15';
    ambientGlow2 = 'bg-blue-600/10';
    weatherEffect = 'night';
  } else {
    // Sunny / Clear daylight
    bgGradient = 'from-sky-100 via-amber-50/50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40';
    ambientGlow1 = 'bg-amber-400/15 dark:bg-amber-500/10';
    ambientGlow2 = 'bg-cyan-400/15 dark:bg-cyan-600/10';
    weatherEffect = 'sunny';
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-1000">
      {/* Base Atmospheric Color Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} transition-colors duration-1000`} />

      {/* Subtle Atmospheric Light Spheres */}
      <div
        className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl ${ambientGlow1} transition-all duration-1000`}
      />
      <div
        className={`absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full blur-3xl ${ambientGlow2} transition-all duration-1000`}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl bg-teal-400/10 dark:bg-teal-500/5 transition-all duration-1000"
      />

      {/* Decorative Weather Particle / Lighting Elements */}
      {weatherEffect === 'sunny' && (
        <div className="absolute -top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-transparent blur-2xl animate-pulse" />
      )}

      {weatherEffect === 'rain' && (
        <div className="absolute inset-0 opacity-15 dark:opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.2)_1px,transparent_1px)] bg-[length:24px_48px] animate-pulse" />
      )}

      {weatherEffect === 'snow' && (
        <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:32px_32px]" />
      )}

      {weatherEffect === 'night' && (
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[length:40px_40px]" />
      )}

      {/* Light-theme microdot grid for depth */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]" />
    </div>
  );
};
