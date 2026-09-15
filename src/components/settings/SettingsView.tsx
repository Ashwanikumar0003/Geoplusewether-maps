import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Thermometer,
  Wind,
  Gauge,
  Key,
  Shield,
  Trash2,
  CheckCircle,
  ExternalLink,
  MapPin,
  RefreshCw,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppSettings, AppTheme } from '../../types/app';
import { TemperatureUnit, WindSpeedUnit, PressureUnit } from '../../types/weather';
import { mapsService, GOOGLE_MAPS_SOLUTION_ID } from '../../services/mapsService';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearLocalData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearLocalData,
}) => {
  const [clearedMsg, setClearedMsg] = useState(false);

  const handleClear = () => {
    onClearLocalData();
    setClearedMsg(true);
    setTimeout(() => setClearedMsg(false), 3000);
  };

  const weatherKeyStr = (import.meta as any).env?.VITE_WEATHER_API_KEY || '';
  const mapsKeyStr = (import.meta as any).env?.VITE_MAPS_API_KEY || '';
  const hasMapsEnv = Boolean(mapsKeyStr);
  const hasWeatherEnv = Boolean(weatherKeyStr);

  const formatKeyMask = (k: string) => {
    if (!k) return 'Not Configured';
    if (k.length <= 10) return `${k.slice(0, 3)}••••`;
    return `${k.slice(0, 6)}••••••••${k.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-cyan-500" />
          <span className="text-xs uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400">
            System Preferences
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          GeoPluse <span className="text-cyan-600 dark:text-cyan-400">Settings</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Customize measurement standards, themes, atmospheric dynamic visuals, and verified API connectivity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Appearance & Theme Card */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun size={18} className="text-amber-500" />
              <span>Appearance & Color Theme</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              Active: {settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Theme Toggle Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Interface Color Scheme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    settings.theme === 'light'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-cyan-500'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun size={15} className="text-amber-500" />
                  <span>Light Theme</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-cyan-500'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon size={15} className="text-cyan-400" />
                  <span>Dark Theme</span>
                </button>
              </div>
            </div>

            {/* Dynamic Weather Backdrop Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Atmospheric Weather Backdrop
              </label>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Dynamic weather imagery</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ enableWeatherAnimations: !(settings.enableWeatherAnimations ?? true) })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.enableWeatherAnimations !== false
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {settings.enableWeatherAnimations !== false ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Preferences Card */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xl backdrop-blur-xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Thermometer size={18} className="text-cyan-500" />
            <span>Meteorological Measurement Standards</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Temperature Unit */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Temperature Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ tempUnit: 'C' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    settings.tempUnit === 'C'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  °C (Celsius)
                </button>
                <button
                  onClick={() => onUpdateSettings({ tempUnit: 'F' })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    settings.tempUnit === 'F'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  °F (Fahrenheit)
                </button>
              </div>
            </div>

            {/* Wind Unit */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Wind Velocity Unit
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['km/h', 'mph', 'm/s'] as WindSpeedUnit[]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => onUpdateSettings({ windUnit: unit })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      settings.windUnit === unit
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Pressure Unit */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Barometric Pressure
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['hPa', 'inHg', 'mmHg'] as PressureUnit[]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => onUpdateSettings({ pressureUnit: unit })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      settings.pressureUnit === unit
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Credentials Status Card */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-emerald-500" />
                <span>Connected APIs Status</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Both required APIs are connected and active. No additional API keys are required.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start">
              <CheckCircle size={14} />
              <span>All Services Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 1. Weather API Key status */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">WeatherAPI Telemetry</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Live Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <code>VITE_WEATHER_API_KEY</code>
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-300 truncate">
                  {hasWeatherEnv ? formatKeyMask(weatherKeyStr) : 'Configured'}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-2">
                Powers real-time weather observations, 24-hour temperature curves, and 7-day forecasts.
              </p>
            </div>

            {/* 2. Maps API Key status */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Maps & Satellite Engine</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Satellite & Places Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <code>VITE_MAPS_API_KEY</code>
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-300 truncate">
                  {hasMapsEnv ? formatKeyMask(mapsKeyStr) : 'Configured & Active'}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-2">
                Powers high-definition satellite imagery, live streets, routes, and real-time POIs (hospitals, fuel, food).
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Declaration & Geolocation Controls */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xl backdrop-blur-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" />
            <span>Strict Privacy & Geolocation Protocol</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>1. Explicit User Permission:</strong> GeoPluse only queries device GPS coordinates when you tap the GPS / Location icon.
            </p>
            <p>
              <strong>2. Real-Time Physical Locations:</strong> Maps places (hospitals, petrol pumps, ATMs, restaurants) are fetched live from global spatial registries for your exact location.
            </p>
          </div>
        </div>

        {/* Data Persistence & Clear Cache */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 size={18} className="text-rose-500" />
              <span>Clear Local Cache & Bookmarks</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Reset cached places and saved searches.
            </p>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all active:scale-95"
          >
            {clearedMsg ? <CheckCircle size={15} /> : <Trash2 size={15} />}
            <span>{clearedMsg ? 'Cleared Successfully' : 'Reset Storage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
