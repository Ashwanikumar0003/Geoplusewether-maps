import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SplashScreen } from './components/common/SplashScreen';
import { AuthModal } from './components/common/AuthModal';
import { LocationSearchModal } from './components/common/LocationSearchModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { WeatherView } from './components/weather/WeatherView';
import { MapsView } from './components/maps/MapsView';
import { SavedPlacesView } from './components/saved/SavedPlacesView';
import { SettingsView } from './components/settings/SettingsView';
import { AtmosphericBackground } from './components/common/AtmosphericBackground';

import {
  ActiveNavigationTab,
  AppSettings,
  AppTheme,
} from './types/app';
import {
  FullWeatherData,
  Coordinates,
  LocationInfo,
} from './types/weather';
import { SavedLocationItem } from './types/maps';
import { weatherService } from './services/weatherService';
import { mapsService } from './services/mapsService';

const DEFAULT_COORDS: Coordinates = { lat: 51.5074, lng: -0.1278 }; // London default
const DEFAULT_LOCATION_NAME = 'London, UK';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  tempUnit: 'C',
  windUnit: 'km/h',
  pressureUnit: 'hPa',
  defaultLocation: {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
  },
  useCurrentLocationOnStartup: false,
};

export default function App() {
  // Splash Screen on initial load
  const [showSplash, setShowSplash] = useState(true);

  // App Navigation
  const [activeTab, setActiveTab] = useState<ActiveNavigationTab>('dashboard');

  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('geopluse_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Current selected coordinates & name
  const [currentCoords, setCurrentCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [currentLocationName, setCurrentLocationName] = useState<string>(DEFAULT_LOCATION_NAME);

  // Weather data state
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search Modal & Recents
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<LocationInfo[]>(() => {
    try {
      const saved = localStorage.getItem('geopluse_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Saved Places
  const [savedPlaces, setSavedPlaces] = useState<SavedLocationItem[]>(() => {
    try {
      const saved = localStorage.getItem('geopluse_saved_places');
      if (saved) return JSON.parse(saved);
      // Pre-seed some world landmarks
      return [
        {
          id: 'sp-1',
          name: 'London',
          country: 'United Kingdom',
          lat: 51.5074,
          lng: -0.1278,
          savedAt: new Date().toISOString(),
        },
        {
          id: 'sp-2',
          name: 'Tokyo',
          country: 'Japan',
          lat: 35.6762,
          lng: 139.6503,
          savedAt: new Date().toISOString(),
        },
        {
          id: 'sp-3',
          name: 'New York',
          country: 'United States',
          lat: 40.7128,
          lng: -74.006,
          savedAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  // User Auth Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('geopluse_user_email');
  });

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Sync Theme with DOM
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('geopluse_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist Saved Places
  useEffect(() => {
    localStorage.setItem('geopluse_saved_places', JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  // Persist Recent Searches
  useEffect(() => {
    localStorage.setItem('geopluse_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch Weather Function
  const fetchWeather = useCallback(
    async (coords: Coordinates, customName?: string) => {
      setIsLoadingWeather(true);
      setWeatherError(null);
      try {
        const safeName = typeof customName === 'string' ? customName : undefined;
        const data = await weatherService.getWeatherData(coords, { name: safeName });
        setWeatherData(data);
        if (safeName) {
          setCurrentLocationName(safeName);
        } else if (data.location?.name) {
          const resolvedName = typeof data.location.name === 'string'
            ? data.location.name
            : (data.location.name as any)?.name || 'Local Area';
          setCurrentLocationName(resolvedName);
        }
      } catch (err: any) {
        console.error('Weather fetch error:', err);
        setWeatherError(err.message || 'Failed to load weather data');
      } finally {
        setIsLoadingWeather(false);
      }
    },
    []
  );

  // Initial Weather Load
  useEffect(() => {
    fetchWeather(currentCoords, currentLocationName);
  }, []);

  // Explicit Browser Geolocation Request
  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const coords: Coordinates = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        };
        setCurrentCoords(coords);

        try {
          const revLocation = await weatherService.reverseGeocode(coords);
          const locationLabel = revLocation?.name
            ? (revLocation.country && revLocation.country !== 'Global'
                ? `${revLocation.name}, ${revLocation.country}`
                : revLocation.name)
            : `GPS (${coords.lat}°, ${coords.lng}°)`;
          setCurrentLocationName(locationLabel);
          fetchWeather(coords, locationLabel);
          showToast(`Location locked: ${locationLabel}`);
        } catch {
          const fallbackName = `GPS (${coords.lat}°, ${coords.lng}°)`;
          setCurrentLocationName(fallbackName);
          fetchWeather(coords, fallbackName);
          showToast(`Location detected: ${fallbackName}`);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          showToast('Location permission was denied. Defaulting to standard coordinates.');
        } else {
          showToast('Unable to acquire GPS signal. Please use manual search.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchWeather, showToast]);

  // Handle Location Selected from Search
  const handleSelectLocation = (loc: LocationInfo) => {
    const coords: Coordinates = { lat: loc.lat, lng: loc.lng };
    setCurrentCoords(coords);
    setCurrentLocationName(loc.name);
    fetchWeather(coords, loc.name);

    // Save to recents
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (p) => Math.abs(p.lat - loc.lat) > 0.01 || Math.abs(p.lng - loc.lng) > 0.01
      );
      return [loc, ...filtered].slice(0, 8);
    });

    showToast(`Loaded ${loc.name}`);
  };

  // Toggle Save Place
  const isCurrentSaved = savedPlaces.some(
    (p) =>
      Math.abs(p.lat - currentCoords.lat) < 0.05 && Math.abs(p.lng - currentCoords.lng) < 0.05
  );

  const handleToggleSaveCurrent = () => {
    if (isCurrentSaved) {
      setSavedPlaces((prev) =>
        prev.filter(
          (p) =>
            Math.abs(p.lat - currentCoords.lat) >= 0.05 ||
            Math.abs(p.lng - currentCoords.lng) >= 0.05
        )
      );
      showToast(`Removed "${currentLocationName}" from saved places`);
    } else {
      const newItem: SavedLocationItem = {
        id: `sp-${Date.now()}`,
        name: currentLocationName,
        country: weatherData?.location.country || '',
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        savedAt: new Date().toISOString(),
      };
      setSavedPlaces((prev) => [newItem, ...prev]);
      showToast(`Saved "${currentLocationName}" to favorites`);
    }
  };

  const handleSavePlaceFromMap = (place: { name: string; lat: number; lng: number }) => {
    const exists = savedPlaces.some(
      (p) => Math.abs(p.lat - place.lat) < 0.01 && Math.abs(p.lng - place.lng) < 0.01
    );
    if (!exists) {
      const newItem: SavedLocationItem = {
        id: `sp-${Date.now()}`,
        name: place.name,
        country: '',
        lat: place.lat,
        lng: place.lng,
        savedAt: new Date().toISOString(),
      };
      setSavedPlaces((prev) => [newItem, ...prev]);
      showToast(`Added "${place.name}" to saved places`);
    } else {
      showToast(`"${place.name}" is already in your saved places`);
    }
  };

  const handleSelectSavedPlaceForWeather = (place: SavedLocationItem) => {
    const coords: Coordinates = { lat: place.lat, lng: place.lng };
    setCurrentCoords(coords);
    setCurrentLocationName(place.name);
    fetchWeather(coords, place.name);
    setActiveTab('weather');
  };

  const handleSelectSavedPlaceForMaps = (place: SavedLocationItem) => {
    const coords: Coordinates = { lat: place.lat, lng: place.lng };
    setCurrentCoords(coords);
    setCurrentLocationName(place.name);
    setActiveTab('maps');
  };

  const handleClearLocalData = () => {
    localStorage.removeItem('geopluse_saved_places');
    localStorage.removeItem('geopluse_recent_searches');
    setSavedPlaces([]);
    setRecentSearches([]);
    showToast('Local cache and bookmarks reset successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative transition-colors duration-300">
      {/* Dynamic Atmospheric Ambient Background */}
      <AtmosphericBackground
        conditionText={weatherData?.current.condition_text}
        isDay={weatherData?.current.is_day}
      />

      {/* Initial Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={settings.theme}
        onToggleTheme={() =>
          setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        }
        onRequestCurrentLocation={handleRequestLocation}
        isLocating={isLocating}
        locationName={currentLocationName}
        currentTemp={weatherData?.current.temp}
        tempUnit={settings.tempUnit}
        onOpenAuth={() => setIsAuthOpen(true)}
        userEmail={userEmail}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            weatherData={weatherData}
            isLoading={isLoadingWeather}
            error={weatherError}
            tempUnit={settings.tempUnit}
            windUnit={settings.windUnit}
            pressureUnit={settings.pressureUnit}
            onRequestLocation={handleRequestLocation}
            isLocating={isLocating}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectTab={setActiveTab}
            onToggleSaveCurrentLocation={handleToggleSaveCurrent}
            isSaved={isCurrentSaved}
            savedPlaces={savedPlaces}
            onSelectSavedPlace={(place) => {
              setCurrentCoords({ lat: place.lat, lng: place.lng });
              setCurrentLocationName(place.name);
              fetchWeather({ lat: place.lat, lng: place.lng }, place.name);
            }}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherView
            weatherData={weatherData}
            isLoading={isLoadingWeather}
            error={weatherError}
            tempUnit={settings.tempUnit}
            windUnit={settings.windUnit}
            pressureUnit={settings.pressureUnit}
            onToggleTempUnit={() =>
              setSettings((s) => ({ ...s, tempUnit: s.tempUnit === 'C' ? 'F' : 'C' }))
            }
            onRequestLocation={handleRequestLocation}
            isLocating={isLocating}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleSaveCurrentLocation={handleToggleSaveCurrent}
            isSaved={isCurrentSaved}
          />
        )}

        {activeTab === 'maps' && (
          <MapsView
            currentCoords={currentCoords}
            currentLocationName={currentLocationName}
            tempUnit={settings.tempUnit}
            onOpenWeatherForLocation={(coords, name) => {
              setCurrentCoords(coords);
              setCurrentLocationName(name);
              fetchWeather(coords, name);
              setActiveTab('weather');
            }}
            onRequestCurrentLocation={handleRequestLocation}
            isLocating={isLocating}
            onSavePlace={handleSavePlaceFromMap}
          />
        )}

        {activeTab === 'saved' && (
          <SavedPlacesView
            savedPlaces={savedPlaces}
            onRemovePlace={(id) => setSavedPlaces((prev) => prev.filter((p) => p.id !== id))}
            onSelectPlaceForWeather={handleSelectSavedPlaceForWeather}
            onSelectPlaceForMaps={handleSelectSavedPlaceForMaps}
            onOpenSearch={() => setIsSearchOpen(true)}
            tempUnit={settings.tempUnit}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
            onClearLocalData={handleClearLocalData}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onSelectTab={setActiveTab} />

      {/* Location Search Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        recentSearches={recentSearches}
      />

      {/* Authentication / Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(email) => {
          setUserEmail(email);
          localStorage.setItem('geopluse_user_email', email);
          showToast(`Welcome, ${email.split('@')[0]}!`);
        }}
      />
    </div>
  );
}
