import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Search,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  AlertTriangle,
  Activity,
  Calendar,
  CloudRain,
  Sun,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  FullWeatherData,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
} from '../../types/weather';
import {
  formatTempDisplay,
  formatWindSpeedDisplay,
  convertPressure,
  getWindCompassDirection,
  convertTemp,
  convertWindSpeed,
} from '../../services/weatherService';
import { WeatherIcon } from '../common/WeatherIcon';

interface WeatherViewProps {
  weatherData: FullWeatherData | null;
  isLoading: boolean;
  error: string | null;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  onToggleTempUnit: () => void;
  onRequestLocation: () => void;
  isLocating: boolean;
  onOpenSearch: () => void;
  onToggleSaveCurrentLocation: () => void;
  isSaved: boolean;
}

type ChartMetric = 'temp' | 'pop' | 'humidity' | 'wind';

export const WeatherView: React.FC<WeatherViewProps> = ({
  weatherData,
  isLoading,
  error,
  tempUnit,
  windUnit,
  pressureUnit,
  onToggleTempUnit,
  onRequestLocation,
  isLocating,
  onOpenSearch,
  onToggleSaveCurrentLocation,
  isSaved,
}) => {
  const [activeChart, setActiveChart] = useState<ChartMetric>('temp');

  if (isLoading && !weatherData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-14 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-full max-w-xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800/40 rounded-3xl" />
      </div>
    );
  }

  if (!weatherData) return null;

  const { location, current, hourly, daily, air_quality, alerts } = weatherData;

  // Format hourly data for recharts
  const chartData = hourly.slice(0, 24).map((h) => ({
    time: h.hour_label,
    temp: convertTemp(h.temp, tempUnit),
    pop: h.pop,
    humidity: h.humidity,
    wind: convertWindSpeed(h.wind_speed, windUnit),
    condition: h.condition_text,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Module Title & Search/Actions Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400">
              Atmospheric Telemetry
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Real-Time Sensor & Radar Model</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            GeoPluse <span className="text-cyan-600 dark:text-cyan-400">Weather</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-all shadow-sm font-semibold"
          >
            <Search size={14} className="text-cyan-500" />
            <span>Search City or Region...</span>
          </button>

          {/* Unit Toggle Celsius / Fahrenheit */}
          <button
            onClick={onToggleTempUnit}
            className="px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-400 transition-all font-mono active:scale-95 shadow-sm"
            title="Toggle Celsius / Fahrenheit"
          >
            {tempUnit === 'C' ? '°C (Metric)' : '°F (Imperial)'}
          </button>

          {/* Geolocation Button */}
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="p-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            title="Locate via GPS"
          >
            <Navigation size={16} className={isLocating ? 'animate-spin' : ''} />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleSaveCurrentLocation}
            className={`p-2.5 rounded-2xl border text-xs transition-all active:scale-95 shadow-sm ${
              isSaved
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save location'}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>

      {/* Main Meteorological Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Location & Big Temp */}
          <div className="lg:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-700 dark:text-cyan-300 font-bold">
              <span>{typeof location.name === 'string' ? location.name : (location.name as any)?.name || 'Local Area'}</span>
              {location.country && typeof location.country === 'string' && <span>, {location.country}</span>}
            </div>

            <div className="flex items-center gap-6">
              <span
                className="text-7xl sm:text-8xl font-black tracking-tighter text-slate-900 dark:text-white font-mono"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatTempDisplay(current.temp, tempUnit)}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <WeatherIcon type={current.icon_type} size={42} />
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {current.condition_text}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Feels like{' '}
                  <strong className="text-slate-900 dark:text-slate-200 font-bold">
                    {formatTempDisplay(current.feels_like, tempUnit)}
                  </strong>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
              High: {formatTempDisplay(current.temp_max, tempUnit)} • Low: {formatTempDisplay(current.temp_min, tempUnit)} • Humidity: {current.humidity}% • Wind: {formatWindSpeedDisplay(current.wind_speed, windUnit)}
            </p>
          </div>

          {/* Right: Environmental Readings */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Droplets size={14} className="text-cyan-500" />
                <span>Humidity</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{current.humidity}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Wind size={14} className="text-teal-500" />
                <span>Wind</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {formatWindSpeedDisplay(current.wind_speed, windUnit)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <CloudRain size={14} className="text-blue-500" />
                <span>Precipitation</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{current.precipitation_chance}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Gauge size={14} className="text-purple-500" />
                <span>Pressure</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {convertPressure(current.pressure, pressureUnit)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Eye size={14} className="text-amber-500" />
                <span>Visibility</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{current.visibility} km</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold">
                <Sun size={14} className="text-yellow-500" />
                <span>UV Index</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{current.uv_index}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Forecast Graphs */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">24-Hour Telemetry Graph</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hourly trend curves for temperature, rain, wind, and humidity.</p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
            {(
              [
                { id: 'temp', label: `Temp (${tempUnit})` },
                { id: 'pop', label: 'Rain %' },
                { id: 'humidity', label: 'Humidity' },
                { id: 'wind', label: 'Wind' },
              ] as { id: ChartMetric; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveChart(m.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeChart === m.id
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Extended Forecast */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-4 backdrop-blur-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">7-Day Meteorological Projections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {daily.map((day) => (
            <div
              key={day.date}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-between text-center space-y-2 shadow-sm"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{day.day_name}</span>
              <WeatherIcon type={day.icon_type} size={30} />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                {day.condition_text}
              </p>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold pt-1">
                <span className="text-slate-400">{formatTempDisplay(day.temp_min, tempUnit)}</span>
                <span className="text-slate-900 dark:text-white">{formatTempDisplay(day.temp_max, tempUnit)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
