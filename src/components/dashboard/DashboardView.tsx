import React from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CloudRain,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import { FullWeatherData, TemperatureUnit, WindSpeedUnit, PressureUnit } from '../../types/weather';
import {
  formatTempDisplay,
  formatWindSpeedDisplay,
  convertPressure,
  getWindCompassDirection,
} from '../../services/weatherService';
import { WeatherIcon } from '../common/WeatherIcon';
import { ActiveNavigationTab } from '../../types/app';

interface DashboardViewProps {
  weatherData: FullWeatherData | null;
  isLoading: boolean;
  error: string | null;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  onRequestLocation: () => void;
  isLocating: boolean;
  onOpenSearch: () => void;
  onSelectTab: (tab: ActiveNavigationTab) => void;
  onToggleSaveCurrentLocation: () => void;
  isSaved: boolean;
  savedPlaces: Array<{ id: string; name: string; country: string; lat: number; lng: number }>;
  onSelectSavedPlace: (coords: { lat: number; lng: number; name: string }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weatherData,
  isLoading,
  error,
  tempUnit,
  windUnit,
  pressureUnit,
  onRequestLocation,
  isLocating,
  onOpenSearch,
  onSelectTab,
  onToggleSaveCurrentLocation,
  isSaved,
  savedPlaces,
  onSelectSavedPlace,
}) => {
  if (isLoading && !weatherData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-14 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-full max-w-xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800/40 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 inline-block mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unable to Retrieve Meteorological Data</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={onRequestLocation}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          Retry with Device Location
        </button>
      </div>
    );
  }

  if (!weatherData) return null;

  const { location, current, hourly, daily, alerts, air_quality } = weatherData;

  const nowFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Action & Search Bar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Quick Search Button / Input Trigger */}
        <div
          onClick={onOpenSearch}
          className="flex-1 max-w-lg flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 hover:border-cyan-500 cursor-pointer shadow-sm transition-all group backdrop-blur-md"
        >
          <Search size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
          <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            Search any city, airport, or region...
          </span>
          <span className="ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Quick Find
          </span>
        </div>

        {/* Right Tools: Geolocation & Save */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            title="Locate via GPS sensors"
          >
            <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Current GPS'}</span>
          </button>

          <button
            onClick={onToggleSaveCurrentLocation}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm ${
              isSaved
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-white/90 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isSaved ? 'Saved in favorites' : 'Add to saved places'}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            <span>{isSaved ? 'Saved' : 'Save Place'}</span>
          </button>
        </div>
      </div>

      {/* Weather Alerts Notification Area (if available) */}
      {alerts && alerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 backdrop-blur-md flex items-start gap-4 shadow-sm">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex-shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-amber-800 dark:text-amber-200">
                {alerts[0].severity}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alerts[0].headline}</h4>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/80 leading-relaxed">{alerts[0].description}</p>
          </div>
        </div>
      )}

      {/* Hero Weather Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/60 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-cyan-950/40 border border-slate-200/80 dark:border-cyan-500/20 shadow-xl backdrop-blur-xl p-6 sm:p-8">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <MapPin size={15} />
              <span>{typeof location.name === 'string' ? location.name : (location.name as any)?.name || 'Local Area'}</span>
              {location.country && typeof location.country === 'string' && (
                <span className="text-slate-500 dark:text-slate-400">• {location.country}</span>
              )}
              <span className="text-slate-400 font-mono hidden sm:inline">
                ({typeof location.lat === 'number' ? location.lat.toFixed(2) : '0.00'}°, {typeof location.lng === 'number' ? location.lng.toFixed(2) : '0.00'}°)
              </span>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <div
                className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white font-mono"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatTempDisplay(current.temp, tempUnit)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <WeatherIcon type={current.icon_type} size={36} />
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {current.condition_text}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 font-medium">
                  <span>Feels like <strong className="text-slate-900 dark:text-slate-200 font-bold">{formatTempDisplay(current.feels_like, tempUnit)}</strong></span>
                  <span>•</span>
                  <span>H: <strong className="text-slate-900 dark:text-slate-200 font-bold">{formatTempDisplay(current.temp_max, tempUnit)}</strong></span>
                  <span>L: <strong className="text-slate-900 dark:text-slate-200 font-bold">{formatTempDisplay(current.temp_min, tempUnit)}</strong></span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
              Currently experiencing {current.condition_text.toLowerCase()} with {current.precipitation_chance}% chance of precipitation. Winds blowing at {formatWindSpeedDisplay(current.wind_speed, windUnit)} from the {getWindCompassDirection(current.wind_direction)}.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar size={13} className="text-cyan-500" />
                <span>{nowFormatted}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-cyan-500" />
                <span>Updated at {current.updated_at}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Grid in Hero */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Droplets size={14} className="text-cyan-500" />
                <span>Humidity</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{current.humidity}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Dew pt: {current.dew_point}°C</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Wind size={14} className="text-teal-500" />
                <span>Wind Speed</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatWindSpeedDisplay(current.wind_speed, windUnit)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {getWindCompassDirection(current.wind_direction)} ({current.wind_direction}°)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <CloudRain size={14} className="text-blue-500" />
                <span>Rain Chance</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {current.precipitation_chance}%
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {current.precipitation_amount ? `${current.precipitation_amount} mm` : '0 mm'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Gauge size={14} className="text-purple-500" />
                <span>Pressure</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {convertPressure(current.pressure, pressureUnit)} {pressureUnit}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Barometric</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Eye size={14} className="text-amber-500" />
                <span>Visibility</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {current.visibility} km
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Atmospheric clarity</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <SunMedium size={14} className="text-yellow-500" />
                <span>UV Index</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{current.uv_index} of 10</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {current.uv_index <= 2 ? 'Low risk' : current.uv_index <= 5 ? 'Moderate' : 'High risk'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>24-Hour Forecast Timeline</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Hourly progression</span>
          </h3>
          <button
            onClick={() => onSelectTab('weather')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>Detailed Charts</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {hourly.map((item, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-24 p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all shadow-sm ${
                i === 0
                  ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/40'
                  : 'bg-white/90 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40'
              }`}
            >
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{item.hour_label}</span>
              <WeatherIcon type={item.icon_type} size={26} className="mb-2" />
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                {formatTempDisplay(item.temp, tempUnit)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 mt-2 font-semibold">
                <CloudRain size={10} />
                <span>{item.pop}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast & Compact Interactive Map Preview (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 7-Day Forecast Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">7-Day Meteorological Outlook</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Daily range & rain</span>
          </div>

          <div className="space-y-2.5">
            {daily.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition-all backdrop-blur-sm shadow-sm"
              >
                <div className="w-24">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{day.day_name}</p>
                  <p className="text-[10px] text-slate-500">{day.date.substring(5)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <WeatherIcon type={day.icon_type} size={22} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 hidden sm:inline truncate max-w-[120px]">
                    {day.condition_text}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 w-14 justify-end font-semibold">
                  {day.pop > 0 && (
                    <>
                      <CloudRain size={12} />
                      <span className="font-mono">{day.pop}%</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 w-28 justify-end font-mono">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTempDisplay(day.temp_min, tempUnit)}
                  </span>
                  <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(20, (day.temp_max - day.temp_min) * 10))}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatTempDisplay(day.temp_max, tempUnit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Interactive Map Preview & Celestial Metrics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Map Preview</h3>
            <button
              onClick={() => onSelectTab('maps')}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Full Maps</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Mini Map Card */}
          <div
            onClick={() => onSelectTab('maps')}
            className="relative h-60 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group cursor-pointer shadow-lg transition-transform hover:scale-[1.01]"
          >
            {/* Map Background visual mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-slate-900 to-slate-950">
              <div
                className="w-full h-full opacity-25"
                style={{
                  backgroundImage:
                    'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />
            </div>

            {/* Orbit / Coordinate Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full border border-cyan-500/30 animate-ping opacity-20" />
              <div className="w-20 h-20 rounded-full border border-cyan-400/40" />
            </div>

            {/* Center Pin & Floating Weather Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="p-2.5 rounded-full bg-rose-500 text-white shadow-xl shadow-rose-500/50 -translate-y-2 animate-bounce">
                <MapPin size={22} />
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold backdrop-blur-md shadow-lg flex items-center gap-2 mt-1">
                <span>{location.name}</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono">
                  {formatTempDisplay(current.temp, tempUnit)}
                </span>
              </div>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Compass size={14} className="text-cyan-500" />
                <span>Explore POIs & Directions</span>
              </div>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
                Open Maps →
              </span>
            </div>
          </div>

          {/* Sun & Air Quality Highlights Card */}
          <div className="grid grid-cols-2 gap-3">
            {/* Celestial Card */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">Sun Schedule</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                    <Sunrise size={15} />
                    <span>Sunrise</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{current.sunrise}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                    <Sunset size={15} />
                    <span>Sunset</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{current.sunset}</span>
                </div>
              </div>
            </div>

            {/* Air Quality Mini Card */}
            {air_quality && (
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Air Quality Index</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                      {air_quality.aqi}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${air_quality.category_color}22`,
                        color: air_quality.category_color,
                      }}
                    >
                      {air_quality.category}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate">
                  PM2.5: {air_quality.pm2_5} µg/m³
                </p>
              </div>
            )}
          </div>

          {/* Saved Places Quick Jump */}
          {savedPlaces.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Quick Saved Places
              </p>
              <div className="flex flex-wrap gap-2">
                {savedPlaces.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectSavedPlace(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors shadow-sm font-medium"
                  >
                    <MapPin size={12} className="text-cyan-500" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
