import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/googleMaps.js';

export default function AddressAutocomplete({ onSelect }) {
  const containerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [error, setError] = useState(null);

  // Keep latest onSelect without re-running the effect
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let element;

    loadGoogleMaps()
      .then(({ PlaceAutocompleteElement }) => {
        if (cancelled || !containerRef.current) return;

        // Create once
        element = new PlaceAutocompleteElement();
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(element);

        // Attach listener once
        element.addEventListener('gmp-select', async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'id'],
          });

          onSelectRef.current({
            name: place.displayName,
            address: place.formattedAddress,
            placeId: place.id,
            lat: place.location?.lat(),
            lng: place.location?.lng(),
          });
        });
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []); // ← runs once only

  if (error) {
    return <div className="oembed-hint">Address lookup unavailable: {error}</div>;
  }

  return <div ref={containerRef} className="places-autocomplete-mount" />;
}
