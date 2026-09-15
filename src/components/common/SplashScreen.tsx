import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [phaseText, setPhaseText] = useState('Initializing GeoPluse Intelligence...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(55);
      setPhaseText('Syncing Meteorological Sensors & Satellite Feeds...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(90);
      setPhaseText('Calibrating Geospatial Maps Engine...');
    }, 800);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setPhaseText('Ready');
    }, 1100);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden">
      {/* Background ambient glow matching logo colors */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none -translate-y-10" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none translate-y-20" />

      {/* Center emblem */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        <div className="relative mb-6 animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Logo size="hero" showText={false} />
          <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl -z-10 animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Geo<span className="text-cyan-400">Pluse</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-cyan-300 font-semibold mb-8">
          Atmospheric & Geospatial Intelligence
        </p>

        {/* Modern progress bar */}
        <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50 mb-3 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 font-mono tracking-tight animate-pulse">
          {phaseText}
        </p>
      </div>

      {/* Footer watermark */}
      <div className="absolute bottom-6 text-slate-500 text-[11px] font-mono">
        GeoPluse Platform v2.4 • Production Ready
      </div>
    </div>
  );
};
