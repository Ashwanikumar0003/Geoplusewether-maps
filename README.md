# GeoPluse

> Precision Meteorological Forecasting & High-Accuracy Geospatial Intelligence Platform

GeoPluse is a modern, responsive, production-ready web application combining real-time atmospheric weather modeling and interactive geospatial mapping into an integrated experience.

---

## Brand Architecture & Modules

The platform is organized into two primary pillars:
1. **GeoPluse Weather**: Real-time atmospheric conditions, humidity, barometric pressure, UV radiation index, dew point, wind vectors, hourly trends, precipitation probability, and 7-day extended forecasts powered by Open-Meteo & WMO meteorological models.
2. **GeoPluse Maps**: High-accuracy geospatial exploration, place search, turn-by-turn routing (driving, walking, bicycling), geodesic distance measurement, nearby point-of-interest (POI) discovery, and live weather overlay integration.

---

## Features

- **Intuitive Dashboard**: Overview with current location, live weather radar, hourly carousel, 7-day outlook, air quality telemetry, and compact interactive map preview.
- **GeoPluse Weather Module**: Interactive analytical charts using `recharts` for hourly temperature, precipitation probability, humidity curves, and wind speed. Includes Air Quality Index (AQI) particulate breakdown (PM2.5, PM10, O₃, NO₂, SO₂, CO).
- **GeoPluse Maps Module**: Interactive map with roadmap/satellite/terrain views, fullscreen mode, address autocomplete, coordinate pinning with localized weather popups, turn-by-turn routing with travel time estimates, straight-line distance measurement, and nearby POI filters (restaurants, hospitals, hotels, petrol pumps, ATMs, tourist attractions).
- **Saved Places & Waypoints**: Bookmark favorite cities and airports locally with quick jump into either Weather or Maps views.
- **Strict Privacy-First Geolocation**: Zero background tracking or telemetry logging. GPS coordinates are only accessed after explicit user authorization.
- **Offline & Demo Mode**: Full interactive simulation engine with realistic spatial POIs and routing paths when API keys are not supplied.
- **Customizable Experience**: Dark/Light mode theme toggle, Celsius/Fahrenheit toggle, wind velocity unit selection (`km/h`, `mph`, `m/s`), and barometric pressure unit selection (`hPa`, `inHg`, `mmHg`).

---

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS with custom display and monospace typographic pairing
- **Charts**: Recharts
- **Maps Platform Integration**: Google Maps JavaScript API via `@googlemaps/js-api-loader` & `@vis.gl/react-google-maps`
- **Weather Services**: Open-Meteo API (WMO compliant) with pluggable service provider architecture
- **Icons**: Lucide React

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to supply your credentials:

```env
# Optional: Weather API Key for premium providers (Open-Meteo free tier is active by default)
VITE_WEATHER_API_KEY=

# Optional: Google Maps Platform API Key
VITE_MAPS_API_KEY=
```

#### Obtaining and Restricting Your Maps API Key

1. **Get an API Key**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio).
   - Or generate a free prototyping key via [Google Maps Demo Key](https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio).

2. **Set Application Restrictions (HTTP Referrers)**:
   - In Google Cloud Console, restrict the key to your domain:
     - `http://localhost:*`
     - `https://your-domain.com/*`

3. **Set API Restrictions**:
   - Restrict the key to only the required APIs:
     - Maps JavaScript API
     - Places API (New)
     - Routes API
     - Geocoding API

4. **Solution Attribution**:
   - All Google Maps Platform calls in GeoPluse carry the official attribution identifier `gmp_mcp_codeassist_v1_aistudio`.

### 3. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
```

This compiles static production assets into `dist/`.

---

## Project Structure

```
geopluse/
├── public/
│   ├── logo.svg           # Vector brand emblem for GeoPluse
│   └── favicon.svg        # Optimized browser favicon
├── src/
│   ├── components/
│   │   ├── common/        # Navbar, Footer, Logo, WeatherIcon, SplashScreen, AuthModal, LocationSearchModal
│   │   ├── dashboard/     # DashboardView (hero metrics, 24h timeline, 7-day outlook, mini map)
│   │   ├── weather/       # WeatherView (deep atmospheric telemetry, recharts analytical trends, AQI)
│   │   ├── maps/          # MapsView (Google Maps SDK & interactive canvas simulation, routing, POIs)
│   │   ├── saved/         # SavedPlacesView (local bookmark catalog with quick-switch)
│   │   └── settings/      # SettingsView (unit preferences, theme toggle, API configuration guide)
│   ├── services/
│   │   ├── weatherService.ts  # Weather provider pattern (Open-Meteo & mock fallback)
│   │   └── mapsService.ts     # Maps loader, routing, geodesic distance, and POI engine
│   ├── types/
│   │   ├── weather.ts     # TypeScript interfaces for meteorological data
│   │   ├── maps.ts        # TypeScript interfaces for geospatial and POI data
│   │   └── app.ts         # Navigation and preference interfaces
│   ├── App.tsx            # Main stateful router and global coordinator
│   ├── main.tsx           # React DOM root entrypoint
│   └── index.css          # Tailwind CSS and typography
├── .env.example           # Documented environment variable template
├── metadata.json          # Applet metadata configuration
└── package.json           # Dependencies and build scripts
```

---

## License

Apache-2.0
