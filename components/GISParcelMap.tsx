// SETU: Interactive GIS Parcel Map Component with Leaflet & GeoJSON

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Property, RiskLevel } from '@/lib/types';
import { calculateParcelAreaAcres } from '@/lib/gis/parcelArea';

interface GISParcelMapProps {
  property: Property;
  riskLevel?: RiskLevel;
  heightClass?: string;
}

export const GISParcelMap: React.FC<GISParcelMapProps> = ({
  property,
  riskLevel,
  heightClass = 'h-80',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [calculatedAcres, setCalculatedAcres] = useState<number>(0);
  const [areaDeviation, setAreaDeviation] = useState<number | null>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      // Clean up previous map instance if it exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!mapContainerRef.current) return;

      const lat = property.latitude || 26.92046;
      const lng = property.longitude || 80.7105;

      // Initialize map with dark theme
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add CartoDB Dark Matter tile layer for futuristic dark theme
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Determine parcel polygon style based on risk
      let strokeColor = '#06b6d4'; // Cyan default
      let fillColor = '#06b6d4';

      if (riskLevel === 'LOW') {
        strokeColor = '#10b981';
        fillColor = '#10b981';
      } else if (riskLevel === 'MEDIUM') {
        strokeColor = '#f59e0b';
        fillColor = '#f59e0b';
      } else if (riskLevel === 'HIGH') {
        strokeColor = '#ef4444';
        fillColor = '#ef4444';
      }

      // Check for geometry and render GeoJSON polygon
      if (
        property.geometry &&
        property.geometry.type === 'Polygon' &&
        property.geometry.coordinates?.[0]?.length >= 3
      ) {
        const acres = calculateParcelAreaAcres(property.geometry);
        if (isSubscribed) {
          setCalculatedAcres(acres);
          if (property.area_value > 0) {
            const diff = Math.abs(acres - property.area_value) / property.area_value;
            setAreaDeviation(diff);
          }
        }

        const geoJsonLayer = L.geoJSON(property.geometry as any, {
          style: {
            color: strokeColor,
            weight: 3,
            opacity: 0.9,
            fillColor: fillColor,
            fillOpacity: 0.25,
            dashArray: '2, 4',
          },
        }).addTo(map);

        // Bind interactive popup
        geoJsonLayer.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; color: #0f172a; padding: 4px; font-size: 12px;">
            <div style="font-weight: 800; color: #0284c7; margin-bottom: 2px;">PARCEL: ${property.khasra_number}</div>
            <div><strong>Owner:</strong> ${property.owner_name}</div>
            <div><strong>Recorded Area:</strong> ${property.area_value} ${property.area_unit}</div>
            <div><strong>GIS Calculated:</strong> ${acres} Acres</div>
            <div><strong>Status:</strong> ${property.encumbrance_status}</div>
          </div>
        `);

        // Fit map bounds to polygon with padding
        try {
          map.fitBounds(geoJsonLayer.getBounds(), { padding: [35, 35] });
        } catch {
          map.setView([lat, lng], 16);
        }
      } else {
        // Fallback: Place circle marker at centroid
        if (isSubscribed) {
          setCalculatedAcres(0);
          setAreaDeviation(null);
        }

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: strokeColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; color: #0f172a; font-size: 12px;">
            <strong>${property.khasra_number}</strong><br/>
            ${property.owner_name}<br/>
            <span style="color: #64748b; font-size: 10px;">Parcel boundary polygon unavailable</span>
          </div>
        `);

        map.setView([lat, lng], 15);
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [property, riskLevel]);

  const hasGeometry = Boolean(
    property.geometry &&
    property.geometry.type === 'Polygon' &&
    property.geometry.coordinates?.[0]?.length >= 3
  );

  return (
    <div className="w-full relative">
      {/* Map Tag Overlay */}
      <div className="absolute right-4 top-4 z-[400] flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] text-cyan-300 font-bold tracking-wide">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>PostGIS Parcel Layer</span>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`${heightClass} w-full rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden bg-[#0b0f19]`}
      />

      {/* Geometry Missing Fallback Warning */}
      {!hasGeometry && (
        <div className="mt-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <span className="text-sm">⚠</span>
          <span>
            Cadastral parcel polygon unavailable in state records for this khasra. Showing centroid coordinates.
          </span>
        </div>
      )}

      {/* Selected Parcel Metadata Strip */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
            Khasra / Gata
          </span>
          <strong className="text-white text-sm font-semibold">{property.khasra_number}</strong>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
            Owner of Record
          </span>
          <strong className="text-cyan-400 text-sm font-semibold truncate block">
            {property.owner_name}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
            Area (Registry vs GIS)
          </span>
          <strong className="text-white text-sm font-semibold">
            {property.area_value} vs {calculatedAcres > 0 ? `${calculatedAcres} Ac` : 'N/A'}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">
            GIS Consistency
          </span>
          <strong
            className={`text-sm font-semibold ${
              areaDeviation !== null && areaDeviation > 0.12
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {hasGeometry
              ? areaDeviation !== null && areaDeviation > 0.12
                ? `Deviation (${(areaDeviation * 100).toFixed(0)}%)`
                : 'Consistent ✓'
              : 'Centroid Only'}
          </strong>
        </div>
      </div>

      {/* Significant Area Discrepancy Warning Box */}
      {areaDeviation !== null && areaDeviation > 0.12 && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>
            <strong>Geospatial Discrepancy Detected:</strong> The GIS calculated polygon area ({calculatedAcres} Acres) deviates by{' '}
            <strong>{(areaDeviation * 100).toFixed(1)}%</strong> from the recorded revenue area ({property.area_value} {property.area_unit}). Field survey ground-truthing advised.
          </span>
        </div>
      )}
    </div>
  );
};
