import { Coordinates, CurrentWeather } from './weather';

export type MapStyleType = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

export type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface RouteResult {
  origin: Coordinates;
  destination: Coordinates;
  originName: string;
  destinationName: string;
  mode: TravelMode;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  summary: string;
  steps: RouteStep[];
  polylineCoordinates?: Coordinates[];
}

export type POICategoryId =
  | 'restaurant'
  | 'hospital'
  | 'hotel'
  | 'gas_station'
  | 'atm'
  | 'tourist_attraction';

export interface POICategory {
  id: POICategoryId;
  label: string;
  iconName: string;
  badgeColor: string;
}

export interface POIPlace {
  id: string;
  name: string;
  category: POICategoryId;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  distanceKm?: number;
  photoUrl?: string;
}

export interface MapMarker {
  id: string;
  title: string;
  subtitle?: string;
  position: Coordinates;
  category?: POICategoryId | 'custom' | 'user' | 'search';
  weather?: Partial<CurrentWeather>;
}

export interface MapLocation {
  name: string;
  coords: Coordinates;
}

export interface SavedLocationItem {
  id: string;
  name: string;
  country?: string;
  lat: number;
  lng: number;
  savedAt: string;
  customLabel?: string;
}

export interface DistanceMeasurement {
  pointA: { name: string; position: Coordinates };
  pointB: { name: string; position: Coordinates };
  distanceKm: number;
  distanceMiles: number;
  estimatedDrivingTime: string;
  estimatedWalkingTime: string;
}
