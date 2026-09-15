import React from 'react';
import { Shield, MapPin, CloudRain, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';
import { ActiveNavigationTab } from '../../types/app';

interface FooterProps {
  onSelectTab: (tab: ActiveNavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Column with Uploaded Logo */}
        <div className="md:col-span-1 space-y-3">
          <Logo size="md" subtitle="Precision Weather & Maps" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            GeoPluse delivers next-generation meteorological forecasting, atmospheric telemetry, and high-accuracy geospatial maps and routing for everyday travel and exploration.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry & Live Places Engine Active</span>
          </div>
        </div>

        {/* Modules Column */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Modules</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => onSelectTab('dashboard')}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                Dashboard Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('weather')}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <CloudRain size={13} className="text-cyan-500" />
                <span>GeoPluse Weather</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('maps')}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <MapPin size={13} className="text-cyan-500" />
                <span>GeoPluse Maps</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('saved')}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                Saved Places & Routes
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('settings')}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                Platform Settings
              </button>
            </li>
          </ul>
        </div>

        {/* Privacy & Compliance Column */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Privacy & Terms</h4>
          <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Explicit Geolocation:</strong> Device location is only queried when you explicitly press the locate button.
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              No continuous background tracking or telemetry logging is executed.
            </p>
          </div>
        </div>

        {/* API Credentials & Developer Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">Connected Services</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Both WeatherAPI and Google Maps API keys are fully verified and active.
          </p>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>WeatherAPI</span>
              <span>Active</span>
            </div>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Maps & Satellite Engine</span>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} GeoPluse. All spatial telemetry rights reserved.</p>
        <p className="text-[11px]">Real-Time Weather & Live Maps Platform</p>
      </div>
    </footer>
  );
};
