import { Coordinates, TemperatureUnit, WindSpeedUnit, PressureUnit, CurrentWeather } from './weather';
import { MapStyleType } from './maps';

export type AppTheme = 'dark' | 'light' | 'system';

export type ActiveNavigationTab = 'dashboard' | 'weather' | 'maps' | 'saved' | 'settings';

export interface SavedPlaceItem {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  addedAt: number;
  order: number;
  weatherSummary?: {
    temp: number;
    condition_text: string;
    icon_type: string;
    humidity: number;
    wind_speed: number;
  };
}

export interface AppSettings {
  theme: AppTheme;
  tempUnit: TemperatureUnit;
  windUnit?: WindSpeedUnit;
  windSpeedUnit?: WindSpeedUnit;
  pressureUnit: PressureUnit;
  defaultLocation?: {
    name: string;
    country: string;
    lat: number;
    lng: number;
  };
  useCurrentLocationOnStartup?: boolean;
  defaultMapType?: MapStyleType;
  weatherApiKey?: string;
  mapsApiKey?: string;
  enableWeatherAnimations?: boolean;
  autoRefreshIntervalMinutes?: number;
}
