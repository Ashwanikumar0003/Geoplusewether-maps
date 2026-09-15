import React, { useEffect, useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Coordinates } from '../../types/weather';
import { MapStyleType, POIPlace, RouteResult } from '../../types/maps';
import { MapPin, Navigation, Compass, AlertTriangle, ExternalLink } from 'lucide-react';

interface GoogleMapContainerProps {
  center: Coordinates;
  zoom?: number;
  mapType?: MapStyleType;
  selectedPoint: {
    coords: Coordinates;
    name: string;
    weather?: { temp: number; text: string; humidity: number; wind: number };
  };
  onMapClick: (coords: Coordinates) => void;
  pois?: POIPlace[];
  onSelectPoi?: (poi: POIPlace) => void;
  routeResult?: RouteResult | null;
  measurePointA?: { name: string; position: Coordinates } | null;
  measurePointB?: { name: string; position: Coordinates } | null;
  className?: string;
}

// Controller to smoothly update Google Map center and zoom
function MapPanController({ center, zoom }: { center: Coordinates; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof center.lat !== 'number' || typeof center.lng !== 'number') return;
    map.panTo({ lat: center.lat, lng: center.lng });
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (!map || typeof zoom !== 'number') return;
    map.setZoom(zoom);
  }, [map, zoom]);

  return null;
}

// Draw Route Polyline directly on the Google Map instance
function RoutePolylineOverlay({ coordinates }: { coordinates: Coordinates[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !coordinates || coordinates.length < 2) return;

    const path = coordinates.map((c) => ({ lat: c.lat, lng: c.lng }));
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#06b6d4',
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, coordinates]);

  return null;
}

// Draw Distance Measurement Line
function MeasurePolylineOverlay({
  pointA,
  pointB,
}: {
  pointA: Coordinates | null;
  pointB: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !pointA || !pointB) return;

    const polyline = new google.maps.Polyline({
      path: [
        { lat: pointA.lat, lng: pointA.lng },
        { lat: pointB.lat, lng: pointB.lng },
      ],
      geodesic: true,
      strokeColor: '#f59e0b',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, pointA, pointB]);

  return null;
}

export const GoogleMapContainer: React.FC<GoogleMapContainerProps> = ({
  center,
  zoom = 13,
  mapType = 'hybrid',
  selectedPoint,
  onMapClick,
  pois = [],
  onSelectPoi,
  routeResult,
  measurePointA,
  measurePointB,
  className = 'w-full h-full min-h-[520px]',
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.VITE_MAPS_API_KEY ||
    '';

  const [activePoiPopup, setActivePoiPopup] = useState<POIPlace | null>(null);

  // Map type conversion to official Google Maps MapTypeId
  // The user explicitly requested the official Google Maps Satellite hybrid view layer
  const googleMapTypeId = useMemo(() => {
    switch (mapType) {
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      case 'terrain':
        return 'terrain';
      case 'roadmap':
      default:
        return 'hybrid'; // Default to hybrid for official satellite imagery with roads & labels
    }
  }, [mapType]);

  // Handle map click from @vis.gl/react-google-maps
  const handleMapClick = (event: any) => {
    if (event.detail?.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        onMapClick({ lat, lng });
      }
    }
  };

  if (!apiKey) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-white ${className}`}>
        <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-400 mb-4">
          <AlertTriangle size={36} />
        </div>
        <h3 className="text-lg font-bold mb-2">Google Maps API Key Required</h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Please provide <code className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-400">VITE_GOOGLE_MAPS_API_KEY</code> in your environment file or Settings to enable the official Google Maps Satellite Hybrid view layer.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-3xl bg-slate-950 ${className}`}
      style={{ width: '100%', height: '100%', minHeight: '520px' }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: center.lat, lng: center.lng }}
          defaultZoom={zoom}
          mapTypeId={googleMapTypeId}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={handleMapClick}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={true}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%', minHeight: '520px' }}
        >
          {/* Pan and Zoom Sync */}
          <MapPanController center={center} zoom={zoom} />

          {/* Route Overlay */}
          {routeResult && routeResult.coordinates && (
            <RoutePolylineOverlay coordinates={routeResult.coordinates} />
          )}

          {/* Measurement Overlay */}
          {measurePointA && measurePointB && (
            <MeasurePolylineOverlay
              pointA={measurePointA.position}
              pointB={measurePointB.position}
            />
          )}

          {/* Main Selected Point Marker */}
          {selectedPoint && typeof selectedPoint.coords.lat === 'number' && (
            <AdvancedMarker
              position={{
                lat: selectedPoint.coords.lat,
                lng: selectedPoint.coords.lng,
              }}
              title={selectedPoint.name}
            >
              <Pin
                background="#06b6d4"
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          )}

          {/* Measurement Marker A */}
          {measurePointA && (
            <AdvancedMarker
              position={{
                lat: measurePointA.position.lat,
                lng: measurePointA.position.lng,
              }}
              title={`Start: ${measurePointA.name}`}
            >
              <Pin
                background="#10b981"
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.0}
              />
            </AdvancedMarker>
          )}

          {/* Measurement Marker B */}
          {measurePointB && (
            <AdvancedMarker
              position={{
                lat: measurePointB.position.lat,
                lng: measurePointB.position.lng,
              }}
              title={`End: ${measurePointB.name}`}
            >
              <Pin
                background="#f59e0b"
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.0}
              />
            </AdvancedMarker>
          )}

          {/* Points of Interest (POIs) Markers */}
          {pois.map((poi) => {
            const pinColor =
              poi.category === 'hospital'
                ? '#ef4444'
                : poi.category === 'restaurant'
                ? '#f97316'
                : poi.category === 'fuel'
                ? '#eab308'
                : poi.category === 'hotel'
                ? '#8b5cf6'
                : poi.category === 'atm'
                ? '#10b981'
                : '#3b82f6';

            return (
              <AdvancedMarker
                key={poi.id}
                position={{ lat: poi.lat, lng: poi.lng }}
                onClick={() => {
                  setActivePoiPopup(poi);
                  if (onSelectPoi) onSelectPoi(poi);
                }}
                title={poi.name}
              >
                <Pin
                  background={pinColor}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={0.9}
                />
              </AdvancedMarker>
            );
          })}

          {/* Active POI Info Window */}
          {activePoiPopup && (
            <InfoWindow
              position={{ lat: activePoiPopup.lat, lng: activePoiPopup.lng }}
              onCloseClick={() => setActivePoiPopup(null)}
            >
              <div className="p-2 max-w-[220px] text-slate-900 font-sans">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                  <MapPin size={14} className="text-cyan-600 shrink-0" />
                  <span className="truncate">{activePoiPopup.name}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight mb-2">
                  {activePoiPopup.address}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200">
                  <span className="font-semibold text-cyan-600 capitalize">
                    {activePoiPopup.category}
                  </span>
                  {activePoiPopup.distanceKm && (
                    <span className="font-mono text-slate-500 font-bold">
                      {activePoiPopup.distanceKm} km away
                    </span>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
