import React, { useState } from 'react';
import {
  Bookmark,
  MapPin,
  Trash2,
  CloudSun,
  Navigation,
  Search,
  Sparkles,
} from 'lucide-react';
import { SavedLocationItem } from '../../types/maps';
import { TemperatureUnit } from '../../types/weather';

interface SavedPlacesViewProps {
  savedPlaces: SavedLocationItem[];
  onRemovePlace: (id: string) => void;
  onSelectPlaceForWeather: (place: SavedLocationItem) => void;
  onSelectPlaceForMaps: (place: SavedLocationItem) => void;
  onOpenSearch: () => void;
  tempUnit: TemperatureUnit;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  savedPlaces,
  onRemovePlace,
  onSelectPlaceForWeather,
  onSelectPlaceForMaps,
  onOpenSearch,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = savedPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (p.country && p.country.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (p.customLabel && p.customLabel.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark size={15} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400">
              Personal Catalog
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Saved Places & <span className="text-cyan-600 dark:text-cyan-400">Waypoints</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Persisted locally on your device for instant meteorological and geospatial telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter saved places..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Sparkles size={14} />
            <span>Add New Place</span>
          </button>
        </div>
      </div>

      {/* Grid of Saved Places */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((place) => (
            <div
              key={place.id}
              className="relative p-5 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-500/50 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {place.country || 'Custom Coordinates'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemovePlace(place.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>
                    {place.lat.toFixed(3)}°, {place.lng.toFixed(3)}°
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Added {new Date(place.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <button
                  onClick={() => onSelectPlaceForWeather(place)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-colors"
                >
                  <CloudSun size={14} />
                  <span>Weather</span>
                </button>

                <button
                  onClick={() => onSelectPlaceForMaps(place)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-colors"
                >
                  <Navigation size={14} />
                  <span>View in Maps</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Saved Places Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Bookmark your favorite cities, travel destinations, or landmarks while exploring the Dashboard, Weather, or Maps modules.
          </p>
          <button
            onClick={onOpenSearch}
            className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            Search & Bookmark a Location
          </button>
        </div>
      )}
    </div>
  );
};
