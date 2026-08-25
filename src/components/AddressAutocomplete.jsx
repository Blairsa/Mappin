import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/googleMaps.js';

/**
 * Wraps google.maps.places.PlaceAutocompleteElement — a Web Component,
 * not a plain <input>, so it's mounted imperatively into a container div
 * rather than rendered as JSX. Calls onSelect({ name, address, placeId, lat, lng })
 * when the user picks a prediction.
 */
export default function AddressAutocomplete({ onSelect }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let element;
    let cancelled = false;

    loadGoogleMaps()
      .then(({ PlaceAutocompleteElement }) => {
        if (cancelled || !containerRef.current) return;
        element = new PlaceAutocompleteElement();
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(element);

        element.addEventListener('gmp-select', async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
          onSelect({
            name: place.displayName,
            address: place.formattedAddress,
            placeId: place.id,
            lat: place.location?.lat(),
            lng: place.location?.lng(),
          });
        });
      })
      .catch((err) => setError(err.message));

    return () => { cancelled = true; };
  }, [onSelect]);

  if (error) {
    return <div className="oembed-hint">Address lookup unavailable: {error}</div>;
  }
  return <div ref={containerRef} className="places-autocomplete-mount" />;
}
