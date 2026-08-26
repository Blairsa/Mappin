import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsCore } from '../lib/googleMaps.js';

/* global google */

// Small SVG dot, matching the old constellation's visited/not-visited look —
// filled circle for visited, hollow ring for not-visited — now used as a
// real marker icon instead of an absolutely-positioned div.
function pinIconUrl(color, visited, size) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <path d="M32 2C18 2 7 13 7 27c0 17 25 35 25 35s25-18 25-35C57 13 46 2 32 2z"
            fill="${visited ? color : '#fff'}"
            stroke="${visited ? '#fff' : color}"
            stroke-width="3"/>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}


/**
 * Real embedded Google Map. Same props as the old dot-constellation version
 * (pins, tags, matchesFilter, onOpenPin, children) so App.jsx didn't need
 * to change at all — only pins with real geo{lat,lng} (i.e. added via the
 * address autocomplete) can be placed on an actual map; anything without
 * one is skipped and counted in the legend instead of silently vanishing.
 */
export default function Constellation({ pins, tags, matchesFilter, onOpenPin, focusRequest, children }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMapsCore()
      .then(({ Map }) => {
        if (cancelled || !mapDivRef.current || mapRef.current) return;
        mapRef.current = new Map(mapDivRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        });
        setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) { setStatus('error'); setErrorMsg(err.message); }
      });
    return () => { cancelled = true; };
  }, []);

  // Sync markers whenever the pin list, tags, or filter state changes.
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    let cancelled = false;

    loadGoogleMapsCore().then(({ Marker }) => {
      if (cancelled) return;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const withGeo = pins.filter((p) => p.geo?.lat != null && p.geo?.lng != null);
      const bounds = new google.maps.LatLngBounds();

      withGeo.forEach((p) => {
        const dimmed = !matchesFilter(p);
        const primary = tags[p.tags?.[0]] || { color: '#5F6368' };
        const visited = (p.rating || 0) > 0;
        const size = visited ? 22 + p.rating * 3 : 20;

        const marker = new Marker({
          position: { lat: p.geo.lat, lng: p.geo.lng },
          map: mapRef.current,
          title: p.name + (visited ? '' : ' (not visited yet)'),
          opacity: dimmed ? 0.18 : 1,
          icon: {
            url: pinIconUrl(primary.color, visited, size),
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size),
          },
        });
        marker.addListener('click', () => onOpenPin(p.id));
        markersRef.current.push(marker);
        bounds.extend(marker.getPosition());
      });

      if (withGeo.length > 0) {
        mapRef.current.fitBounds(bounds, 60);
        if (withGeo.length === 1) mapRef.current.setZoom(13);
      }
    });

    return () => { cancelled = true; };
  }, [pins, tags, matchesFilter, status, onOpenPin]);

  // Pan/zoom to whatever set of pins the toolbar's city picker asked for.
  useEffect(() => {
    if (!focusRequest || status !== 'ready' || !mapRef.current) return;
    const withGeo = (focusRequest.pins || []).filter((p) => p.geo?.lat != null && p.geo?.lng != null);
    if (withGeo.length === 0) return;
    if (withGeo.length === 1) {
      mapRef.current.panTo({ lat: withGeo[0].geo.lat, lng: withGeo[0].geo.lng });
      mapRef.current.setZoom(14);
    } else {
      const bounds = new google.maps.LatLngBounds();
      withGeo.forEach((p) => bounds.extend({ lat: p.geo.lat, lng: p.geo.lng }));
      mapRef.current.fitBounds(bounds, 80);
    }
  }, [focusRequest, status]);

  const missingGeoCount = pins.filter((p) => !(p.geo?.lat != null && p.geo?.lng != null)).length;

  return (
    <div className="constellation">
      <div ref={mapDivRef} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />

      {status === 'error' && (
        <div className="oembed-hint" style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: 24, background: 'var(--surface)',
        }}>
          Map failed to load: {errorMsg}
        </div>
      )}

      {children /* floating search/filter controls, mounted here by App.jsx */}

      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot filled" />Visited</span>
        <span className="legend-item"><span className="legend-dot ring" />Not visited yet</span>
        {missingGeoCount > 0 && (
          <span className="legend-item">{missingGeoCount} pin{missingGeoCount === 1 ? '' : 's'} without an address not shown</span>
        )}
      </div>
    </div>
  );
}
