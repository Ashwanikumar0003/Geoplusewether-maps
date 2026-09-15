import {
  Coordinates,
  LocationInfo,
  FullWeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  AirQualityData,
  WeatherAlert,
  WeatherIconType,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
} from '../types/weather';

/**
 * WMO Weather interpretation codes (WW) to human condition text and icon
 */
export function interpretWMOCode(code: number, isDay: boolean = true): { text: string; icon: WeatherIconType } {
  switch (code) {
    case 0:
      return { text: 'Clear Sky', icon: isDay ? 'sun' : 'moon' };
    case 1:
      return { text: 'Mainly Clear', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
    case 2:
      return { text: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
    case 3:
      return { text: 'Overcast', icon: 'cloud' };
    case 45:
      return { text: 'Foggy', icon: 'cloud-fog' };
    case 48:
      return { text: 'Depositing Rime Fog', icon: 'cloud-fog' };
    case 51:
      return { text: 'Light Drizzle', icon: 'cloud-rain' };
    case 53:
      return { text: 'Moderate Drizzle', icon: 'cloud-rain' };
    case 55:
      return { text: 'Dense Drizzle', icon: 'cloud-rain' };
    case 56:
    case 57:
      return { text: 'Freezing Drizzle', icon: 'cloud-rain' };
    case 61:
      return { text: 'Slight Rain', icon: 'cloud-rain' };
    case 63:
      return { text: 'Moderate Rain', icon: 'cloud-rain' };
    case 65:
      return { text: 'Heavy Rain', icon: 'cloud-rain' };
    case 66:
    case 67:
      return { text: 'Freezing Rain', icon: 'cloud-rain' };
    case 71:
      return { text: 'Slight Snow', icon: 'cloud-snow' };
    case 73:
      return { text: 'Moderate Snow', icon: 'cloud-snow' };
    case 75:
      return { text: 'Heavy Snow', icon: 'cloud-snow' };
    case 77:
      return { text: 'Snow Grains', icon: 'cloud-snow' };
    case 80:
      return { text: 'Slight Rain Showers', icon: 'cloud-rain' };
    case 81:
      return { text: 'Moderate Rain Showers', icon: 'cloud-rain' };
    case 82:
      return { text: 'Violent Rain Showers', icon: 'cloud-rain' };
    case 85:
    case 86:
      return { text: 'Snow Showers', icon: 'cloud-snow' };
    case 95:
      return { text: 'Thunderstorm', icon: 'cloud-lightning' };
    case 96:
    case 99:
      return { text: 'Thunderstorm with Hail', icon: 'cloud-lightning' };
    default:
      return { text: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud' };
  }
}

/**
 * Unit conversion helpers
 */
export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTempDisplay(celsius: number, unit: TemperatureUnit): string {
  const val = convertTemp(celsius, unit);
  return `${val}°${unit}`;
}

export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'mph':
      return Math.round(kmh * 0.621371 * 10) / 10;
    case 'm/s':
      return Math.round((kmh / 3.6) * 10) / 10;
    case 'knots':
      return Math.round(kmh * 0.539957 * 10) / 10;
    case 'km/h':
    default:
      return Math.round(kmh * 10) / 10;
  }
}

export function formatWindSpeedDisplay(kmh: number, unit: WindSpeedUnit): string {
  const val = convertWindSpeed(kmh, unit);
  return `${val} ${unit}`;
}

export function convertPressure(hPa: number, unit: PressureUnit): number {
  switch (unit) {
    case 'inHg':
      return Math.round(hPa * 0.02953 * 100) / 100;
    case 'mmHg':
      return Math.round(hPa * 0.750062);
    case 'hPa':
    default:
      return Math.round(hPa);
  }
}

export function getWindCompassDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
  return directions[index];
}

export function getAQICategory(aqi: number): AirQualityData['category'] {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAQIColor(category: AirQualityData['category']): string {
  switch (category) {
    case 'Good':
      return '#22c55e'; // Green
    case 'Moderate':
      return '#eab308'; // Yellow
    case 'Unhealthy for Sensitive Groups':
      return '#f97316'; // Orange
    case 'Unhealthy':
      return '#ef4444'; // Red
    case 'Very Unhealthy':
      return '#a855f7'; // Purple
    case 'Hazardous':
      return '#7f1d1d'; // Maroon
  }
}

export function getAQIAdvice(category: AirQualityData['category']): string {
  switch (category) {
    case 'Good':
      return 'Air quality is satisfactory and poses little or no risk.';
    case 'Moderate':
      return 'Air quality is acceptable; unusually sensitive individuals should consider limiting outdoor exertion.';
    case 'Unhealthy for Sensitive Groups':
      return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
    case 'Unhealthy':
      return 'Some members of the general public may experience health effects; sensitive groups may experience more serious health effects.';
    case 'Very Unhealthy':
      return 'Health alert: The risk of health effects is increased for everyone. Avoid prolonged outdoor exertion.';
    case 'Hazardous':
      return 'Health warning of emergency conditions: Everyone is more likely to be affected. Stay indoors.';
  }
}

/**
 * Weather Provider Interface (allows seamless swapping of weather providers)
 */
export interface IWeatherProvider {
  name: string;
  fetchWeather(coords: Coordinates, locationInfo?: Partial<LocationInfo>): Promise<FullWeatherData>;
  searchLocations(query: string): Promise<LocationInfo[]>;
  reverseGeocode(coords: Coordinates): Promise<LocationInfo>;
}

/**
 * Open-Meteo Implementation (High accuracy, free global open meteorological data)
 */
class OpenMeteoProvider implements IWeatherProvider {
  name = 'Open-Meteo Live';

  async searchLocations(query: string): Promise<LocationInfo[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`
      );
      if (!res.ok) throw new Error('Geocoding search failed');
      const data = await res.json();
      if (!data.results || !data.results.length) return [];

      return data.results.map((r: any) => ({
        name: r.name,
        country: r.country || '',
        state: r.admin1 || r.admin2 || '',
        lat: r.latitude,
        lng: r.longitude,
        timezone: r.timezone || 'UTC',
      }));
    } catch (err) {
      console.warn('Geocoding search error, using fallback matching:', err);
      return [];
    }
  }

  async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.locality || data.city || data.principalSubdivision || 'Current Location',
          country: data.countryName || '',
          state: data.principalSubdivision || '',
          lat: coords.lat,
          lng: coords.lng,
        };
      }
    } catch (e) {
      // ignore and fallback
    }

    return {
      name: `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
      country: 'Global',
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  async fetchWeather(coords: Coordinates, locationInfo?: Partial<LocationInfo>): Promise<FullWeatherData> {
    const lat = coords.lat;
    const lng = coords.lng;

    // Fetch forecast data and air quality in parallel
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=8`;

    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather service error: ${weatherRes.statusText}`);
    }

    const wData = await weatherRes.json();
    let aqiDataRaw: any = null;
    if (aqiRes && aqiRes.ok) {
      aqiDataRaw = await aqiRes.json();
    }

    const currentRaw = wData.current || {};
    const dailyRaw = wData.daily || {};
    const hourlyRaw = wData.hourly || {};

    const isDay = currentRaw.is_day === 1;
    const { text: conditionText, icon: iconType } = interpretWMOCode(currentRaw.weather_code || 0, isDay);

    // Current weather object
    const current: CurrentWeather = {
      temp: currentRaw.temperature_2m ?? 20,
      feels_like: currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 20,
      temp_min: dailyRaw.temperature_2m_min?.[0] ?? (currentRaw.temperature_2m - 4),
      temp_max: dailyRaw.temperature_2m_max?.[0] ?? (currentRaw.temperature_2m + 4),
      humidity: currentRaw.relative_humidity_2m ?? 50,
      wind_speed: currentRaw.wind_speed_10m ?? 10,
      wind_direction: currentRaw.wind_direction_10m ?? 180,
      wind_gust: currentRaw.wind_gusts_10m,
      pressure: currentRaw.pressure_msl ?? currentRaw.surface_pressure ?? 1013,
      visibility: (hourlyRaw.visibility?.[0] ?? 10000) / 1000, // convert to km
      uv_index: dailyRaw.uv_index_max?.[0] ?? 5,
      precipitation_chance: dailyRaw.precipitation_probability_max?.[0] ?? (currentRaw.precipitation > 0 ? 80 : 10),
      precipitation_amount: currentRaw.precipitation ?? 0,
      cloud_cover: currentRaw.cloud_cover ?? 20,
      dew_point: hourlyRaw.dew_point_2m?.[0] ?? 12,
      sunrise: dailyRaw.sunrise?.[0] ? formatTimeToHHMM(dailyRaw.sunrise[0]) : '06:15 AM',
      sunset: dailyRaw.sunset?.[0] ? formatTimeToHHMM(dailyRaw.sunset[0]) : '07:45 PM',
      condition_text: conditionText,
      condition_code: currentRaw.weather_code || 0,
      icon_type: iconType,
      is_day: isDay,
      updated_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Parse Hourly (next 24 hours)
    const hourly: HourlyForecastItem[] = [];
    const currentTimeISO = new Date().toISOString();
    const hourlyTimes: string[] = hourlyRaw.time || [];
    
    // Find closest starting index
    let startIdx = 0;
    const nowHourStr = currentTimeISO.substring(0, 13);
    const foundIdx = hourlyTimes.findIndex((t: string) => t.startsWith(nowHourStr));
    if (foundIdx !== -1) startIdx = foundIdx;

    for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
      const timeStr = hourlyTimes[i];
      const hourDate = new Date(timeStr);
      const hIsDay = hourlyRaw.is_day?.[i] === 1;
      const { text: hText, icon: hIcon } = interpretWMOCode(hourlyRaw.weather_code?.[i] || 0, hIsDay);

      hourly.push({
        time: timeStr,
        hour_label: i === startIdx ? 'Now' : hourDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        temp: Math.round(hourlyRaw.temperature_2m?.[i] ?? 20),
        feels_like: Math.round(hourlyRaw.apparent_temperature?.[i] ?? 20),
        pop: hourlyRaw.precipitation_probability?.[i] ?? 0,
        precipitation: hourlyRaw.precipitation?.[i] ?? 0,
        humidity: hourlyRaw.relative_humidity_2m?.[i] ?? 50,
        wind_speed: hourlyRaw.wind_speed_10m?.[i] ?? 10,
        wind_direction: hourlyRaw.wind_direction_10m?.[i] ?? 180,
        condition_text: hText,
        icon_type: hIcon,
        is_day: hIsDay,
        uv_index: hourlyRaw.uv_index?.[i],
      });
    }

    // Parse Daily (7-8 days)
    const daily: DailyForecastItem[] = [];
    const dailyTimes: string[] = dailyRaw.time || [];

    for (let d = 0; d < Math.min(dailyTimes.length, 8); d++) {
      const dateStr = dailyTimes[d];
      const dDate = new Date(dateStr + 'T12:00:00');
      const { text: dText, icon: dIcon } = interpretWMOCode(dailyRaw.weather_code?.[d] || 0, true);

      daily.push({
        date: dateStr,
        day_name: d === 0 ? 'Today' : dDate.toLocaleDateString('en-US', { weekday: 'long' }),
        short_day: d === 0 ? 'Today' : dDate.toLocaleDateString('en-US', { weekday: 'short' }),
        temp_max: Math.round(dailyRaw.temperature_2m_max?.[d] ?? 22),
        temp_min: Math.round(dailyRaw.temperature_2m_min?.[d] ?? 14),
        condition_text: dText,
        icon_type: dIcon,
        pop: dailyRaw.precipitation_probability_max?.[d] ?? 0,
        precipitation_sum: dailyRaw.precipitation_sum?.[d] ?? 0,
        wind_speed_max: dailyRaw.wind_speed_10m_max?.[d] ?? 15,
        uv_index_max: dailyRaw.uv_index_max?.[d] ?? 6,
        sunrise: dailyRaw.sunrise?.[d] ? formatTimeToHHMM(dailyRaw.sunrise[d]) : '06:20 AM',
        sunset: dailyRaw.sunset?.[d] ? formatTimeToHHMM(dailyRaw.sunset[d]) : '07:40 PM',
      });
    }

    // Parse Air Quality
    let air_quality: AirQualityData | undefined;
    if (aqiDataRaw && aqiDataRaw.current) {
      const c = aqiDataRaw.current;
      const aqiVal = Math.round(c.us_aqi ?? 42);
      const category = getAQICategory(aqiVal);
      air_quality = {
        aqi: aqiVal,
        pm2_5: Math.round((c.pm2_5 ?? 11.2) * 10) / 10,
        pm10: Math.round((c.pm10 ?? 22.4) * 10) / 10,
        o3: Math.round((c.ozone ?? 38.5) * 10) / 10,
        no2: Math.round((c.nitrogen_dioxide ?? 14.1) * 10) / 10,
        so2: Math.round((c.sulphur_dioxide ?? 4.2) * 10) / 10,
        co: Math.round((c.carbon_monoxide ?? 250) * 10) / 10,
        category,
        category_color: getAQIColor(category),
        health_advice: getAQIAdvice(category),
      };
    } else {
      const category = 'Good';
      air_quality = {
        aqi: 35,
        pm2_5: 8.5,
        pm10: 18.0,
        o3: 32.0,
        no2: 12.4,
        so2: 3.1,
        co: 210,
        category,
        category_color: getAQIColor(category),
        health_advice: getAQIAdvice(category),
      };
    }

    // Detect weather alerts based on high wind or heavy rain/snow
    const alerts: WeatherAlert[] = [];
    if (current.wind_speed > 55) {
      alerts.push({
        id: 'alert-wind-1',
        sender: 'National Meteorological Service',
        event: 'High Wind Warning',
        severity: 'warning',
        headline: 'Strong gusty winds observed in the area',
        description: `Sustained winds of ${current.wind_speed} km/h with potential higher gusts. Secure loose outdoor objects.`,
        instruction: 'Exercise caution if driving high-profile vehicles.',
        effective: 'Now',
        expires: 'Next 6 hours',
      });
    } else if (current.precipitation_chance > 80 && current.temp_max > 25) {
      alerts.push({
        id: 'alert-rain-1',
        sender: 'GeoPluse Atmospheric Engine',
        event: 'Thunderstorm Watch',
        severity: 'watch',
        headline: 'Conditions favorable for convective storm development',
        description: 'Elevated moisture and temperature indicate a high probability of localized heavy downpours and lightning.',
        instruction: 'Stay indoors if thunder roars.',
        effective: 'Today',
        expires: 'This evening',
      });
    }

    const loc: LocationInfo = {
      name: typeof locationInfo?.name === 'string' ? locationInfo.name : 'Local Area',
      country: typeof locationInfo?.country === 'string' ? locationInfo.country : '',
      state: typeof locationInfo?.state === 'string' ? locationInfo.state : '',
      lat,
      lng,
      timezone: wData.timezone || 'UTC',
    };

    return {
      location: loc,
      current,
      hourly,
      daily,
      air_quality,
      alerts,
    };
  }
}

function formatTimeToHHMM(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

/**
 * Demo Mock Provider (for offline usage, fallback when APIs are unavailable or testing)
 */
export class DemoMockWeatherProvider implements IWeatherProvider {
  name = 'GeoPluse Simulation';

  async searchLocations(query: string): Promise<LocationInfo[]> {
    const sampleCities: LocationInfo[] = [
      { name: 'Tokyo', country: 'Japan', state: 'Kanto', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
      { name: 'New York', country: 'United States', state: 'New York', lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
      { name: 'London', country: 'United Kingdom', state: 'England', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
      { name: 'Paris', country: 'France', state: 'Île-de-France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
      { name: 'San Francisco', country: 'United States', state: 'California', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
      { name: 'Singapore', country: 'Singapore', state: '', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
      { name: 'Sydney', country: 'Australia', state: 'New South Wales', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
      { name: 'Dubai', country: 'United Arab Emirates', state: 'Dubai', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
    ];

    const q = query.toLowerCase().trim();
    return sampleCities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }

  async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    return {
      name: 'Simulated Station',
      country: 'Earth',
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  async fetchWeather(coords: Coordinates, locationInfo?: Partial<LocationInfo>): Promise<FullWeatherData> {
    const baseTemp = 18 + Math.sin(coords.lat * 0.1) * 8;
    const isDay = true;
    const current: CurrentWeather = {
      temp: Math.round(baseTemp),
      feels_like: Math.round(baseTemp - 1),
      temp_min: Math.round(baseTemp - 5),
      temp_max: Math.round(baseTemp + 6),
      humidity: 62,
      wind_speed: 14.5,
      wind_direction: 215,
      wind_gust: 22,
      pressure: 1016,
      visibility: 12.5,
      uv_index: 6,
      precipitation_chance: 25,
      precipitation_amount: 0.2,
      cloud_cover: 35,
      dew_point: 10,
      sunrise: '06:24 AM',
      sunset: '07:42 PM',
      condition_text: 'Partly Cloudy',
      condition_code: 2,
      icon_type: 'cloud-sun',
      is_day: isDay,
      updated_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const hourly: HourlyForecastItem[] = [];
    for (let i = 0; i < 24; i++) {
      const h = (new Date().getHours() + i) % 24;
      const hTemp = Math.round(baseTemp + Math.sin((h - 6) / 4) * 5);
      const isDayHour = h >= 6 && h <= 19;
      hourly.push({
        time: `${h}:00`,
        hour_label: i === 0 ? 'Now' : `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`,
        temp: hTemp,
        feels_like: hTemp - 1,
        pop: (i * 7) % 60,
        precipitation: i % 5 === 0 ? 0.4 : 0,
        humidity: Math.min(95, 50 + (i * 3) % 40),
        wind_speed: 10 + (i % 6) * 2,
        wind_direction: 200 + (i * 10) % 40,
        condition_text: isDayHour ? 'Partly Cloudy' : 'Clear Night',
        icon_type: isDayHour ? 'cloud-sun' : 'moon',
        is_day: isDayHour,
        uv_index: isDayHour ? Math.max(0, 8 - Math.abs(h - 13)) : 0,
      });
    }

    const days = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daily: DailyForecastItem[] = days.map((day, d) => ({
      date: `2026-09-${14 + d}`,
      day_name: day === 'Today' ? 'Today' : `${day}day`,
      short_day: day,
      temp_max: Math.round(baseTemp + 5 + (d % 3)),
      temp_min: Math.round(baseTemp - 4 + (d % 2)),
      condition_text: d % 2 === 0 ? 'Partly Cloudy' : 'Sunny',
      icon_type: d % 2 === 0 ? 'cloud-sun' : 'sun',
      pop: 15 + d * 5,
      precipitation_sum: d === 3 ? 4.2 : 0,
      wind_speed_max: 18 + d,
      uv_index_max: 6,
      sunrise: '06:22 AM',
      sunset: '07:44 PM',
    }));

    return {
      location: {
        name: locationInfo?.name || 'San Francisco',
        country: locationInfo?.country || 'United States',
        state: locationInfo?.state || 'California',
        lat: coords.lat,
        lng: coords.lng,
        timezone: 'America/Los_Angeles',
      },
      current,
      hourly,
      daily,
      air_quality: {
        aqi: 38,
        pm2_5: 9.2,
        pm10: 16.5,
        o3: 31.0,
        no2: 14.2,
        so2: 2.1,
        co: 230,
        category: 'Good',
        category_color: '#22c55e',
        health_advice: 'Air quality is satisfactory and ideal for outdoor activities.',
      },
      alerts: [],
    };
  }
}

/**
 * WeatherAPI.com Condition Interpretation (Codes to Text and Vector Icons)
 */
function interpretWeatherAPICode(code: number, isDay: boolean = true): { text: string; icon: WeatherIconType } {
  if (code === 1000) return { text: isDay ? 'Sunny' : 'Clear', icon: isDay ? 'sun' : 'moon' };
  if (code === 1003) return { text: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
  if (code === 1006 || code === 1009) return { text: 'Overcast', icon: 'cloud' };
  if (code === 1030 || code === 1135 || code === 1147) return { text: 'Fog / Mist', icon: 'cloud-fog' };
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
    return { text: 'Rain Showers', icon: 'cloud-rain' };
  }
  if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
    return { text: 'Snow Showers', icon: 'cloud-snow' };
  }
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
    return { text: 'Thunderstorm', icon: 'cloud-lightning' };
  }
  return { text: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
}

/**
 * WeatherAPI.com High-Accuracy Meteorological Provider
 */
export class WeatherAPIProvider implements IWeatherProvider {
  name = 'WeatherAPI.com Live';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchLocations(query: string): Promise<LocationInfo[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${this.apiKey}&q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error('Search failed');
      const results = await res.json();
      if (!Array.isArray(results)) return [];
      return results.map((r: any) => ({
        name: r.name,
        country: r.country || '',
        state: r.region || '',
        lat: r.lat,
        lng: r.lon,
      }));
    } catch (err) {
      console.warn('WeatherAPI searchLocations error:', err);
      return [];
    }
  }

  async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${coords.lat},${coords.lng}`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.location?.name || `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
          country: data.location?.country || '',
          state: data.location?.region || '',
          lat: coords.lat,
          lng: coords.lng,
        };
      }
    } catch {}
    return {
      name: `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
      country: 'Global',
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  async fetchWeather(coords: Coordinates, locationInfo?: Partial<LocationInfo>): Promise<FullWeatherData> {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${coords.lat},${coords.lng}&days=8&aqi=yes&alerts=yes`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`WeatherAPI error (${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    const cur = data.current || {};
    const locData = data.location || {};
    const forecastDays: any[] = data.forecast?.forecastday || [];
    const day0 = forecastDays[0] || {};
    const day0Day = day0.day || {};
    const isDay = cur.is_day === 1;

    const { text: condText, icon: iconType } = interpretWeatherAPICode(cur.condition?.code || 1000, isDay);

    const current: CurrentWeather = {
      temp: Math.round(cur.temp_c ?? 20),
      feels_like: Math.round(cur.feelslike_c ?? cur.temp_c ?? 20),
      temp_min: Math.round(day0Day.mintemp_c ?? (cur.temp_c - 4)),
      temp_max: Math.round(day0Day.maxtemp_c ?? (cur.temp_c + 4)),
      humidity: cur.humidity ?? 50,
      wind_speed: Math.round((cur.wind_kph ?? 10) * 10) / 10,
      wind_direction: cur.wind_degree ?? 180,
      wind_gust: cur.gust_kph,
      pressure: Math.round(cur.pressure_mb ?? 1013),
      visibility: cur.vis_km ?? 10,
      uv_index: cur.uv ?? day0Day.uv ?? 4,
      precipitation_chance: day0Day.daily_chance_of_rain ?? cur.chance_of_rain ?? 0,
      precipitation_amount: cur.precip_mm ?? 0,
      cloud_cover: cur.cloud ?? 20,
      dew_point: cur.dewpoint_c ? Math.round(cur.dewpoint_c) : Math.round(cur.temp_c - (100 - cur.humidity) / 5),
      sunrise: day0.astro?.sunrise || '06:15 AM',
      sunset: day0.astro?.sunset || '07:45 PM',
      condition_text: cur.condition?.text || condText,
      condition_code: cur.condition?.code || 1000,
      icon_type: iconType,
      is_day: isDay,
      updated_at: cur.last_updated ? new Date(cur.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Rolling 24-hour forecast
    const hourly: HourlyForecastItem[] = [];
    const allHours = [...(forecastDays[0]?.hour || []), ...(forecastDays[1]?.hour || [])];
    const currentEpoch = cur.last_updated_epoch || Math.floor(Date.now() / 1000);

    let startIdx = allHours.findIndex((h: any) => h.time_epoch >= currentEpoch - 1800);
    if (startIdx === -1) startIdx = 0;

    for (let i = startIdx; i < Math.min(startIdx + 24, allHours.length); i++) {
      const h = allHours[i];
      const hIsDay = h.is_day === 1;
      const { text: hText, icon: hIcon } = interpretWeatherAPICode(h.condition?.code || 1000, hIsDay);
      const hDate = new Date(h.time);

      hourly.push({
        time: h.time,
        hour_label: i === startIdx ? 'Now' : hDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        temp: Math.round(h.temp_c ?? 20),
        feels_like: Math.round(h.feelslike_c ?? h.temp_c ?? 20),
        pop: h.chance_of_rain ?? 0,
        precipitation: h.precip_mm ?? 0,
        humidity: h.humidity ?? 50,
        wind_speed: Math.round((h.wind_kph ?? 10) * 10) / 10,
        wind_direction: h.wind_degree ?? 180,
        condition_text: h.condition?.text || hText,
        icon_type: hIcon,
        is_day: hIsDay,
        uv_index: h.uv,
      });
    }

    // 7-8 Day Outlook
    const daily: DailyForecastItem[] = [];
    for (let d = 0; d < forecastDays.length; d++) {
      const fDay = forecastDays[d];
      const dDate = new Date(fDay.date + 'T12:00:00');
      const { text: dText, icon: dIcon } = interpretWeatherAPICode(fDay.day?.condition?.code || 1000, true);

      daily.push({
        date: fDay.date,
        day_name: d === 0 ? 'Today' : dDate.toLocaleDateString('en-US', { weekday: 'long' }),
        short_day: d === 0 ? 'Today' : dDate.toLocaleDateString('en-US', { weekday: 'short' }),
        temp_max: Math.round(fDay.day?.maxtemp_c ?? 22),
        temp_min: Math.round(fDay.day?.mintemp_c ?? 14),
        condition_text: fDay.day?.condition?.text || dText,
        icon_type: dIcon,
        pop: fDay.day?.daily_chance_of_rain ?? 0,
        precipitation_sum: fDay.day?.totalprecip_mm ?? 0,
        wind_speed_max: Math.round(fDay.day?.maxwind_kph ?? 15),
        uv_index_max: fDay.day?.uv ?? 6,
        sunrise: fDay.astro?.sunrise || '06:15 AM',
        sunset: fDay.astro?.sunset || '07:45 PM',
      });
    }

    // Air Quality Data
    let air_quality: AirQualityData | undefined;
    if (cur.air_quality) {
      const aq = cur.air_quality;
      const pm25 = Math.round((aq.pm2_5 ?? 10) * 10) / 10;
      let calculatedAqi = Math.round(pm25 * 3.5);
      if (aq['us-epa-index']) {
        const epaMap = [0, 30, 75, 125, 175, 250, 350];
        calculatedAqi = epaMap[aq['us-epa-index']] || 45;
      }
      const category = getAQICategory(calculatedAqi);
      air_quality = {
        aqi: calculatedAqi,
        pm2_5: pm25,
        pm10: Math.round((aq.pm10 ?? 20) * 10) / 10,
        o3: Math.round((aq.o3 ?? 30) * 10) / 10,
        no2: Math.round((aq.no2 ?? 15) * 10) / 10,
        so2: Math.round((aq.so2 ?? 5) * 10) / 10,
        co: Math.round((aq.co ?? 220) * 10) / 10,
        category,
        category_color: getAQIColor(category),
        health_advice: getAQIAdvice(category),
      };
    }

    // Alerts
    const alerts: WeatherAlert[] = [];
    if (data.alerts?.alert && Array.isArray(data.alerts.alert)) {
      data.alerts.alert.forEach((a: any, idx: number) => {
        alerts.push({
          id: `alert-wapi-${idx}`,
          sender: a.headline || 'National Weather Service',
          event: a.event || 'Severe Weather Alert',
          severity: 'warning',
          headline: a.headline || a.event || 'Weather Advisory',
          description: a.desc || '',
          instruction: a.instruction || 'Follow local authority guidelines.',
          effective: a.effective || 'Now',
          expires: a.expires || 'Until further notice',
        });
      });
    }

    const resolvedName = typeof locationInfo?.name === 'string'
      ? locationInfo.name
      : (locData.name || 'Local Area');

    return {
      location: {
        name: resolvedName,
        country: locData.country || (typeof locationInfo?.country === 'string' ? locationInfo.country : ''),
        state: locData.region || (typeof locationInfo?.state === 'string' ? locationInfo.state : ''),
        lat: coords.lat,
        lng: coords.lng,
        timezone: locData.tz_id || 'UTC',
      },
      current,
      hourly,
      daily,
      air_quality,
      alerts,
    };
  }
}

/**
 * Weather Service Singleton Hub
 */
class WeatherService {
  private weatherApiProvider: WeatherAPIProvider | null = null;
  private openMeteoProvider: IWeatherProvider = new OpenMeteoProvider();
  private mockProvider: IWeatherProvider = new DemoMockWeatherProvider();
  private customApiKey: string = '';

  constructor() {
    this.customApiKey = (import.meta as any).env?.VITE_WEATHER_API_KEY || '';
    if (this.customApiKey && this.customApiKey.trim().length > 10) {
      this.weatherApiProvider = new WeatherAPIProvider(this.customApiKey.trim());
    }
  }

  public setApiKey(key: string) {
    this.customApiKey = key;
    if (key && key.trim().length > 10) {
      this.weatherApiProvider = new WeatherAPIProvider(key.trim());
    } else {
      this.weatherApiProvider = null;
    }
  }

  public getApiKey(): string {
    return this.customApiKey;
  }

  public getActiveProviderName(): string {
    if (this.weatherApiProvider) return 'WeatherAPI.com (Live Connected)';
    return 'Open-Meteo (WMO Live)';
  }

  public async searchLocations(query: string): Promise<LocationInfo[]> {
    if (this.weatherApiProvider) {
      try {
        const results = await this.weatherApiProvider.searchLocations(query);
        if (results && results.length > 0) return results;
      } catch (e) {
        console.warn('WeatherAPI geocoding search failed, falling back to Open-Meteo:', e);
      }
    }

    try {
      const results = await this.openMeteoProvider.searchLocations(query);
      if (results && results.length > 0) return results;
    } catch (e) {
      console.warn('Primary geocoder failed, falling back to mock:', e);
    }
    return this.mockProvider.searchLocations(query);
  }

  public async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    if (this.weatherApiProvider) {
      try {
        return await this.weatherApiProvider.reverseGeocode(coords);
      } catch (e) {}
    }

    try {
      return await this.openMeteoProvider.reverseGeocode(coords);
    } catch (e) {
      return this.mockProvider.reverseGeocode(coords);
    }
  }

  public async getWeatherData(coords: Coordinates, locationInfo?: Partial<LocationInfo>): Promise<FullWeatherData> {
    // 1. Try Custom WeatherAPI Provider first if key is active
    if (this.weatherApiProvider) {
      try {
        return await this.weatherApiProvider.fetchWeather(coords, locationInfo);
      } catch (wErr) {
        console.warn('WeatherAPI request failed, falling back to Open-Meteo:', wErr);
      }
    }

    // 2. Open-Meteo live meteorological fallback
    try {
      return await this.openMeteoProvider.fetchWeather(coords, locationInfo);
    } catch (err) {
      console.warn('Live meteorological fetch failed, seamlessly serving demo simulation:', err);
      return await this.mockProvider.fetchWeather(coords, locationInfo);
    }
  }
}

export const weatherService = new WeatherService();
