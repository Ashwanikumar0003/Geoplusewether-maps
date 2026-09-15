export type TemperatureUnit = 'C' | 'F';
export type WindSpeedUnit = 'km/h' | 'mph' | 'm/s' | 'knots';
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  timezone?: string;
}

export type WeatherIconType =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'cloud-rain'
  | 'cloud-lightning'
  | 'cloud-snow'
  | 'cloud-fog'
  | 'wind'
  | 'moon'
  | 'cloud-moon';

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number; // 0 - 360 degrees
  wind_gust?: number;
  pressure: number;
  visibility: number; // in meters or km
  uv_index: number;
  precipitation_chance: number; // percentage 0-100
  precipitation_amount?: number; // in mm
  cloud_cover: number; // 0-100%
  dew_point: number;
  sunrise: string;
  sunset: string;
  condition_text: string;
  condition_code: number;
  icon_type: WeatherIconType;
  is_day: boolean;
  updated_at: string;
}

export interface HourlyForecastItem {
  time: string; // ISO or formatted
  hour_label: string; // "14:00" or "2 PM"
  temp: number;
  feels_like: number;
  pop: number; // Probability of precipitation %
  precipitation: number; // mm
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  condition_text: string;
  icon_type: WeatherIconType;
  is_day: boolean;
  uv_index?: number;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  day_name: string; // "Monday"
  short_day: string; // "Mon"
  temp_max: number;
  temp_min: number;
  condition_text: string;
  icon_type: WeatherIconType;
  pop: number; // %
  precipitation_sum: number; // mm
  wind_speed_max: number;
  uv_index_max: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  aqi: number; // US AQI or European AQI 0-500
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  category_color: string;
  health_advice: string;
}

export interface WeatherAlert {
  id: string;
  sender: string;
  event: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  headline: string;
  description: string;
  instruction?: string;
  effective: string;
  expires: string;
}

export interface FullWeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  air_quality?: AirQualityData;
  alerts: WeatherAlert[];
}
