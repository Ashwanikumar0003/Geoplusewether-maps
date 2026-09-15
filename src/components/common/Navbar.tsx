import React, { useState } from 'react';
import {
  LayoutDashboard,
  CloudSun,
  MapPin,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Navigation,
  Search,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Logo } from './Logo';
import { ActiveNavigationTab, AppTheme } from '../../types/app';
import { formatTempDisplay } from '../../services/weatherService';
import { TemperatureUnit } from '../../types/weather';

interface NavbarProps {
  activeTab: ActiveNavigationTab;
  onSelectTab: (tab: ActiveNavigationTab) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onRequestCurrentLocation: () => void;
  isLocating?: boolean;
  locationName?: string;
  currentTemp?: number;
  tempUnit: TemperatureUnit;
  onOpenAuth: () => void;
  userEmail?: string | null;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  onRequestCurrentLocation,
  isLocating = false,
  locationName,
  currentTemp,
  tempUnit,
  onOpenAuth,
  userEmail,
  onOpenSearch,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveNavigationTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weather', label: 'GeoPluse Weather', icon: CloudSun },
    { id: 'maps', label: 'Maps', icon: MapPin },
    { id: 'saved', label: 'Saved Places', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tab: ActiveNavigationTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Logo */}
          <div
            onClick={() => handleTabClick('dashboard')}
            className="cursor-pointer flex-shrink-0"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search trigger */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                title="Search city or coordinates"
              >
                <Search size={14} className="text-cyan-500" />
                <span className="hidden md:inline">Search location...</span>
              </button>
            )}

            {/* Current Location Quick Info Badge */}
            {currentTemp !== undefined && locationName && (
              <div
                onClick={() => handleTabClick('weather')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-700 dark:text-cyan-300 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                title="View live weather details"
              >
                <span className="font-semibold truncate max-w-[120px]">
                  {typeof locationName === 'string' ? locationName : (locationName as any)?.name || 'Local Area'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatTempDisplay(currentTemp, tempUnit)}
                </span>
              </div>
            )}

            {/* Geolocation GPS Button */}
            <button
              onClick={onRequestCurrentLocation}
              disabled={isLocating}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              title="Detect device GPS location"
            >
              <Navigation size={17} className={isLocating ? 'animate-spin' : ''} />
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-amber-500 hover:text-amber-400 transition-all active:scale-95 shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Auth / Account Profile Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              title={userEmail ? `Signed in as ${userEmail}` : 'Sign In to sync'}
            >
              <User size={15} className="text-cyan-500" />
              <span className="hidden sm:inline">
                {userEmail ? userEmail.split('@')[0] : 'Sign In'}
              </span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
