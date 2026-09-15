import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates } from '../../types/weather';
import { MapStyleType, POIPlace, RouteResult } from '../../types/maps';

interface LeafletMapContainerProps {
  center: Coordinates;
  zoom?: number;
  mapType: MapStyleType;
  selectedPoint: { coords: Coordinates; name: string };
  onMapClick: (coords: Coordinates) => void;
  pois: POIPlace[];
  onSelectPoi: (poi: POIPlace) => void;
  routeResult: RouteResult | null;
  measurePointA?: { name: string; position: Coordinates } | null;
  measurePointB?: { name: string; position: Coordinates } | null;
  className?: string;
}

export const LeafletMapContainer: React.FC<LeafletMapContainerProps> = ({
  center,
  zoom = 13,
  mapType,
  selectedPoint,
  onMapClick,
  pois,
  onSelectPoi,
  routeResult,
  measurePointA,
  measurePointB,
  className = 'w-full h-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const hybridLabelLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const measureLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Layer groups
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      measureLayerGroupRef.current = L.layerGroup().addTo(map);

      // Map Click Handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer based on mapType
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (hybridLabelLayerRef.current) {
      map.removeLayer(hybridLabelLayerRef.current);
      hybridLabelLayerRef.current = null;
    }

    if (mapType === 'satellite' || mapType === 'hybrid') {
      // True high-resolution Esri World Imagery (Satellite)
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery',
        }
      ).addTo(map);

      // In hybrid mode, add reference boundaries and labels
      if (mapType === 'hybrid') {
        hybridLabelLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
          }
        ).addTo(map);
      }
    } else if (mapType === 'terrain') {
      // Topographic & terrain elevation map
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 17,
          subdomains: 'abc',
        }
      ).addTo(map);
    } else {
      // Default: Clean CartoDB Voyager / OpenStreetMap Street Map
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);
    }
  }, [mapType]);

  // Update Center when center prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const currentCenter = map.getCenter();
    const dist = Math.hypot(currentCenter.lat - center.lat, currentCenter.lng - center.lng);
    if (dist > 0.0001) {
      map.flyTo([center.lat, center.lng], map.getZoom() || 13, {
        duration: 1.2,
      });
    }
  }, [center.lat, center.lng]);

  // Update Selected Point Marker & POI Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Render Selected Point / Current Location Marker
    if (selectedPoint) {
      const selectedIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping"></span>
            <span class="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500 text-white shadow-xl ring-2 ring-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const selMarker = L.marker([selectedPoint.coords.lat, selectedPoint.coords.lng], {
        icon: selectedIcon,
        zIndexOffset: 1000,
      }).addTo(markersGroup);

      selMarker.bindTooltip(selectedPoint.name, {
        permanent: false,
        direction: 'top',
        className: 'text-xs font-semibold px-2 py-1 bg-slate-900 text-white rounded-lg shadow-lg border border-slate-700',
      });
    }

    // 2. Render POI Markers with category-specific colors and icons
    const categoryColors: Record<string, { bg: string; text: string }> = {
      restaurant: { bg: '#f97316', text: '#fff' },
      hospital: { bg: '#ef4444', text: '#fff' },
      hotel: { bg: '#8b5cf6', text: '#fff' },
      gas_station: { bg: '#0ea5e9', text: '#fff' },
      atm: { bg: '#10b981', text: '#fff' },
      tourist_attraction: { bg: '#eab308', text: '#000' },
    };

    pois.forEach((poi) => {
      const color = categoryColors[poi.category] || { bg: '#0284c7', text: '#fff' };
      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white" style="background-color: ${color.bg}; color: ${color.text}">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon }).addTo(markersGroup);

      marker.on('click', () => {
        onSelectPoi(poi);
      });

      // Tooltip with rating and distance
      marker.bindTooltip(
        `<strong>${poi.name}</strong><br/><span style="font-size:11px;color:#cbd5e1">${poi.distanceKm ? poi.distanceKm + ' km away' : ''} ${poi.rating ? '★ ' + poi.rating : ''}</span>`,
        {
          direction: 'top',
          className: 'px-2 py-1 text-xs bg-slate-900 text-white rounded-lg border border-slate-700 shadow-xl',
        }
      );
    });
  }, [selectedPoint, pois, onSelectPoi]);

  // Update Route Polyline
  useEffect(() => {
    const routeGroup = routeLayerGroupRef.current;
    if (!routeGroup) return;

    routeGroup.clearLayers();

    if (routeResult && routeResult.polylineCoordinates && routeResult.polylineCoordinates.length > 1) {
      const latLngs: [number, number][] = routeResult.polylineCoordinates.map((c) => [c.lat, c.lng]);

      // Route Outer Glow Polyline
      L.polyline(latLngs, {
        color: '#06b6d4',
        weight: 8,
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);

      // Route Inner Vibrant Line
      const routePolyline = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.95,
        dashArray: '2, 6',
      }).addTo(routeGroup);

      // Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-xl ring-2 ring-white -translate-x-1/2 -translate-y-1/2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([routeResult.destination.lat, routeResult.destination.lng], { icon: destIcon }).addTo(routeGroup);

      // Fit bounds to show route
      const map = mapInstanceRef.current;
      if (map) {
        map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
      }
    }
  }, [routeResult]);

  // Update Measurement Tool Layer
  useEffect(() => {
    const measureGroup = measureLayerGroupRef.current;
    if (!measureGroup) return;

    measureGroup.clearLayers();

    if (measurePointA && measurePointB) {
      const p1: [number, number] = [measurePointA.position.lat, measurePointA.position.lng];
      const p2: [number, number] = [measurePointB.position.lat, measurePointB.position.lng];

      // Measure Line
      L.polyline([p1, p2], {
        color: '#f59e0b',
        weight: 3,
        dashArray: '5, 8',
      }).addTo(measureGroup);

      // Markers for A and B
      const iconA = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-2 ring-white">A</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const iconB = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-lg ring-2 ring-white">B</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(p1, { icon: iconA }).addTo(measureGroup);
      L.marker(p2, { icon: iconB }).addTo(measureGroup);
    }
  }, [measurePointA, measurePointB]);

  return <div ref={mapContainerRef} className={className} />;
};
