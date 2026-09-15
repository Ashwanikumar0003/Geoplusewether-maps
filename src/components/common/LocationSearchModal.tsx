import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Clock, Loader2 } from 'lucide-react';
import { LocationInfo } from '../../types/weather';
import { weatherService } from '../../services/weatherService';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationInfo) => void;
  recentSearches: LocationInfo[];
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  recentSearches,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const found = await weatherService.searchLocations(query);
        setResults(found);
      } catch (e) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search size={18} className="text-cyan-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, state, or country..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {isLoading ? (
            <Loader2 size={16} className="text-cyan-500 animate-spin" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Results / Recents List */}
        <div className="max-h-80 overflow-y-auto p-3">
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              <div className="space-y-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Locations Found
                </p>
                {results.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lng}-${idx}`}
                    onClick={() => {
                      onSelectLocation(item);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[item.state, item.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matching locations found for "{query}". Try another city name.
              </div>
            ) : null
          ) : recentSearches.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} />
                <span>Recent Searches</span>
              </p>
              {recentSearches.map((item, idx) => (
                <button
                  key={`recent-${idx}`}
                  onClick={() => {
                    onSelectLocation(item);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[item.state, item.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type a city or region to explore real-time weather and maps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
