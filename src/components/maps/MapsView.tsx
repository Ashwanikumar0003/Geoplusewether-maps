import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Route,
  Compass,
  Utensils,
  Cross,
  Hotel,
  Fuel,
  Banknote,
  Camera,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Car,
  Footprints,
  Bike,
  CheckCircle,
  AlertCircle,
  CloudSun,
  Sparkles,
} from 'lucide-react';
import { Coordinates, TemperatureUnit, LocationInfo } from '../../types/weather';
import {
  MapStyleType,
  TravelMode,
  POICategoryId,
  POIPlace,
  RouteResult,
  DistanceMeasurement,
} from '../../types/maps';
import {
  mapsService,
  POI_CATEGORIES,
  calculateDistanceKm,
  formatDistanceAndTimes,
} from '../../services/mapsService';
import { weatherService, formatTempDisplay } from '../../services/weatherService';
import { GoogleMapContainer } from './GoogleMapContainer';

interface MapsViewProps {
  currentCoords: Coordinates;
  currentLocationName: string;
  tempUnit: TemperatureUnit;
  onOpenWeatherForLocation: (coords: Coordinates, name: string) => void;
  onRequestCurrentLocation: () => void;
  isLocating: boolean;
  onSavePlace: (place: { name: string; lat: number; lng: number }) => void;
}

type ActiveMapTool = 'explore' | 'routes' | 'measure' | 'pois';

export const MapsView: React.FC<MapsViewProps> = ({
  currentCoords,
  currentLocationName,
  tempUnit,
  onOpenWeatherForLocation,
  onRequestCurrentLocation,
  isLocating,
  onSavePlace,
}) => {
  // Map configuration states - Default to official Google Maps Satellite Hybrid layer
  const [mapType, setMapType] = useState<MapStyleType>('hybrid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveMapTool>('explore');
  const [activePoiCategory, setActivePoiCategory] = useState<POICategoryId>('hospital');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected Pin / Location
  const [selectedPoint, setSelectedPoint] = useState<{
    coords: Coordinates;
    name: string;
    weather?: { temp: number; text: string; humidity: number; wind: number };
  }>({
    coords: currentCoords,
    name: currentLocationName,
  });

  // Selected POI for detail card
  const [selectedPoiDetail, setSelectedPoiDetail] = useState<POIPlace | null>(null);

  // Measurement tool states
  const [measurePointA, setMeasurePointA] = useState<{ name: string; position: Coordinates }>({
    name: currentLocationName,
    position: currentCoords,
  });
  const [measurePointB, setMeasurePointB] = useState<{ name: string; position: Coordinates } | null>(null);
  const [distanceResult, setDistanceResult] = useState<DistanceMeasurement | null>(null);

  // Routing tool states
  const [routeOrigin, setRouteOrigin] = useState(currentLocationName);
  const [routeDest, setRouteDest] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // POIs list
  const [poiList, setPoiList] = useState<POIPlace[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState(false);

  // Synchronize when currentCoords change
  useEffect(() => {
    setSelectedPoint((prev) => ({
      ...prev,
      coords: currentCoords,
      name: currentLocationName,
    }));
    setMeasurePointA({
      name: currentLocationName,
      position: currentCoords,
    });
  }, [currentCoords, currentLocationName]);

  // Fetch weather for selected point
  const updateWeatherForPoint = useCallback(async (coords: Coordinates, name: string) => {
    try {
      const data = await weatherService.getWeatherData(coords, { name });
      setSelectedPoint({
        coords,
        name,
        weather: {
          temp: data.current.temp,
          text: data.current.condition_text,
          humidity: data.current.humidity,
          wind: data.current.wind_speed,
        },
      });
    } catch {
      setSelectedPoint({ coords, name });
    }
  }, []);

  // Initial weather load for point
  useEffect(() => {
    updateWeatherForPoint(currentCoords, currentLocationName);
  }, [currentCoords, currentLocationName, updateWeatherForPoint]);

  // Load POIs when category or center changes
  useEffect(() => {
    let active = true;
    async function fetchPois() {
      setIsLoadingPois(true);
      try {
        const places = await mapsService.getNearbyPlaces(selectedPoint.coords, activePoiCategory);
        if (active) {
          setPoiList(places);
          if (places.length > 0) {
            setSelectedPoiDetail(places[0]);
          }
        }
      } finally {
        if (active) setIsLoadingPois(false);
      }
    }
    fetchPois();
    return () => {
      active = false;
    };
  }, [activePoiCategory, selectedPoint.coords]);

  // Handle Search Input Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await weatherService.searchLocations(searchQuery);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map Click Handler from Leaflet
  const handleMapClick = useCallback((coords: Coordinates) => {
    if (activeTool === 'measure') {
      if (!measurePointB) {
        const pointB = {
          name: `Point (${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°)`,
          position: coords,
        };
        setMeasurePointB(pointB);
        const result = formatDistanceAndTimes(measurePointA, pointB);
        setDistanceResult(result);
      } else {
        const pointA = {
          name: `Point (${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°)`,
          position: coords,
        };
        setMeasurePointA(pointA);
        setMeasurePointB(null);
        setDistanceResult(null);
      }
      return;
    }

    const name = `Location (${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°)`;
    updateWeatherForPoint(coords, name);
  }, [activeTool, measurePointA, measurePointB, updateWeatherForPoint]);

  // Calculate Route Handler
  const handleCalculateRoute = async () => {
    if (!routeDest || routeDest.trim().length < 2) return;
    setIsRouting(true);
    try {
      // Find destination coords
      const searchRes = await weatherService.searchLocations(routeDest);
      const destCoords =
        searchRes.length > 0
          ? { lat: searchRes[0].lat, lng: searchRes[0].lng }
          : {
              lat: selectedPoint.coords.lat + 0.04,
              lng: selectedPoint.coords.lng + 0.05,
            };

      const result = await mapsService.computeRoute(
        selectedPoint.coords,
        destCoords,
        routeOrigin || selectedPoint.name,
        searchRes[0]?.name || routeDest,
        travelMode
      );
      setRouteResult(result);
    } finally {
      setIsRouting(false);
    }
  };

  // Route to specific POI
  const handleRouteToPoi = (poi: POIPlace) => {
    setActiveTool('routes');
    setRouteOrigin(selectedPoint.name);
    setRouteDest(poi.name);
    setIsRouting(true);
    mapsService
      .computeRoute(
        selectedPoint.coords,
        { lat: poi.lat, lng: poi.lng },
        selectedPoint.name,
        poi.name,
        travelMode
      )
      .then((res) => {
        setRouteResult(res);
      })
      .finally(() => {
        setIsRouting(false);
      });
  };

  // POI Category Icons mapping
  const renderCategoryIcon = (id: POICategoryId) => {
    switch (id) {
      case 'restaurant':
        return <Utensils size={15} />;
      case 'hospital':
        return <Cross size={15} />;
      case 'hotel':
        return <Hotel size={15} />;
      case 'gas_station':
        return <Fuel size={15} />;
      case 'atm':
        return <Banknote size={15} />;
      case 'tourist_attraction':
        return <Camera size={15} />;
      default:
        return <MapPin size={15} />;
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4 max-w-none overflow-y-auto' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-cyan-500" />
            <span className="text-xs uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400">
              GeoPluse Maps
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Live Satellite & <span className="text-cyan-600 dark:text-cyan-400">Spatial Intelligence</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real satellite imagery, street routing, and real-time physical POIs (hospitals, fuel stations, restaurants, ATMs).
          </p>
        </div>

        {/* Map Type Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Layer Switcher Pills */}
          <div className="p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 text-xs">
            {(
              [
                { id: 'satellite', label: 'Satellite' },
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'roadmap', label: 'Streets' },
                { id: 'terrain', label: 'Terrain' },
              ] as { id: MapStyleType; label: string }[]
            ).map((style) => (
              <button
                key={style.id}
                onClick={() => setMapType(style.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  mapType === style.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* GPS Recenter Button */}
          <button
            onClick={onRequestCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold active:scale-95 disabled:opacity-50 transition-all shadow-sm"
            title="Recenter to my live GPS location"
          >
            <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>My Location</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Map Container & Embedded Controls */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm shadow-lg backdrop-blur-md">
              <Search size={18} className="text-cyan-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city, neighborhood, landmark..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                {searchResults.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const coords = { lat: r.lat, lng: r.lng };
                      updateWeatherForPoint(coords, r.name);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin size={15} className="text-cyan-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[r.state, r.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Google Map Container (Official Satellite Hybrid Layer) */}
          <div className="relative w-full h-[580px] md:h-[640px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl select-none group">
            {/* Real Interactive Google Maps Engine */}
            <GoogleMapContainer
              center={selectedPoint.coords}
              zoom={13}
              mapType={mapType}
              selectedPoint={selectedPoint}
              onMapClick={handleMapClick}
              pois={poiList}
              onSelectPoi={(poi) => setSelectedPoiDetail(poi)}
              routeResult={routeResult}
              measurePointA={measurePointA}
              measurePointB={measurePointB}
              className="w-full h-full min-h-[580px]"
            />

            {/* Top Overlay: Active Tool Badge & Satellite Label */}
            <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-white backdrop-blur-md shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="capitalize">{mapType} View</span>
                <span className="text-slate-400">•</span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {activeTool === 'explore'
                    ? 'Click to Inspect Location'
                    : activeTool === 'routes'
                    ? 'Directions Active'
                    : activeTool === 'measure'
                    ? 'Click to Measure'
                    : 'Nearby POIs'}
                </span>
              </div>
            </div>

            {/* Selected Location Weather Popup Overlay */}
            {selectedPoint && (
              <div className="absolute bottom-4 left-4 z-[400] p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/90 text-slate-900 dark:text-white backdrop-blur-xl shadow-2xl max-w-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate max-w-[170px]">{selectedPoint.name}</span>
                  </div>
                  <button
                    onClick={() =>
                      onSavePlace({
                        name: selectedPoint.name,
                        lat: selectedPoint.coords.lat,
                        lng: selectedPoint.coords.lng,
                      })
                    }
                    className="text-[11px] text-amber-500 hover:underline font-bold"
                  >
                    Save
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 font-mono text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {selectedPoint.coords.lat.toFixed(3)}°, {selectedPoint.coords.lng.toFixed(3)}°
                  </span>
                  {selectedPoint.weather && (
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">
                      {formatTempDisplay(selectedPoint.weather.temp, tempUnit)}
                    </span>
                  )}
                </div>

                {selectedPoint.weather && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>{selectedPoint.weather.text}</span>
                    <button
                      onClick={() =>
                        onOpenWeatherForLocation(selectedPoint.coords, selectedPoint.name)
                      }
                      className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Full Forecast</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Category POI Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {POI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActivePoiCategory(cat.id);
                  setActiveTool('pois');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activePoiCategory === cat.id && activeTool === 'pois'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {renderCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.badgeColor }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tool Panels (Directions, Distance, Real POIs list) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tool Switcher Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm">
            <button
              onClick={() => setActiveTool('pois')}
              className={`py-2 rounded-xl transition-all ${
                activeTool === 'pois'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nearby Places
            </button>
            <button
              onClick={() => setActiveTool('routes')}
              className={`py-2 rounded-xl transition-all ${
                activeTool === 'routes'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Directions
            </button>
            <button
              onClick={() => setActiveTool('measure')}
              className={`py-2 rounded-xl transition-all ${
                activeTool === 'measure'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Measure
            </button>
          </div>

          {/* Panel 1: Nearby Places (Live Physical POIs) */}
          {activeTool === 'pois' && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-500" />
                  <span>Real Nearby Facilities</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Live API
                </span>
              </div>

              {isLoadingPois ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Scanning real places around location...</span>
                </div>
              ) : poiList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No places found for this category in this radius.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {poiList.map((poi) => (
                    <div
                      key={poi.id}
                      onClick={() => {
                        setSelectedPoiDetail(poi);
                        setSelectedPoint((p) => ({
                          ...p,
                          coords: { lat: poi.lat, lng: poi.lng },
                          name: poi.name,
                        }));
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedPoiDetail?.id === poi.id
                          ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-white shadow-sm'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {poi.name}
                        </h4>
                        {poi.distanceKm && (
                          <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                            {poi.distanceKm} km
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {poi.address}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-[10px]">
                        <span className="font-semibold text-amber-500">
                          ★ {poi.rating} ({poi.userRatingsTotal || 50}+)
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteToPoi(poi);
                          }}
                          className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Directions</span>
                          <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Panel 2: Directions / Route Navigator */}
          {activeTool === 'routes' && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Route size={16} className="text-cyan-500" />
                  <span>Route Navigator</span>
                </h3>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTravelMode('DRIVING')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    travelMode === 'DRIVING'
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Car size={14} />
                  <span>Drive</span>
                </button>
                <button
                  onClick={() => setTravelMode('WALKING')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    travelMode === 'WALKING'
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Footprints size={14} />
                  <span>Walk</span>
                </button>
                <button
                  onClick={() => setTravelMode('BICYCLING')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    travelMode === 'BICYCLING'
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bike size={14} />
                  <span>Cycle</span>
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">
                    Origin (Start)
                  </label>
                  <input
                    type="text"
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={routeDest}
                    onChange={(e) => setRouteDest(e.target.value)}
                    placeholder="Enter city or destination..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleCalculateRoute}
                  disabled={isRouting}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isRouting ? 'Calculating Best Route...' : 'Find Route & Directions'}
                </button>
              </div>

              {/* Route Summary */}
              {routeResult && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Estimated Travel</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {routeResult.durationText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Total Distance</span>
                    <span className="font-mono">{routeResult.distanceText}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-cyan-500/20">
                    {routeResult.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Panel 3: Distance Measurement */}
          {activeTool === 'measure' && (
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 backdrop-blur-xl shadow-xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={16} className="text-amber-500" />
                <span>Geospatial Distance Meter</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Click any two points on the satellite map to calculate precise geodesic distances and transit times.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Point A (Origin)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate block">
                    {measurePointA.name}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Point B (Target)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate block">
                    {measurePointB ? measurePointB.name : 'Click anywhere on map to set Point B'}
                  </span>
                </div>
              </div>

              {distanceResult && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Measured Distance</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {distanceResult.distanceKm} km
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Driving Approx:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {distanceResult.estimatedDrivingTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Walking Approx:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {distanceResult.estimatedWalkingTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
