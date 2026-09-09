// AddressAutocomplete.jsx — full replacement
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../lib/googleMaps.js';

export default function AddressAutocomplete({ onSelect, autoQuery }) {
  const containerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [error, setError] = useState(null);
  const [autoSearching, setAutoSearching] = useState(!!autoQuery);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let element;

    loadGoogleMaps()
      .then(async (places) => {
        if (cancelled || !containerRef.current) return;
        const { PlaceAutocompleteElement, AutocompleteSuggestion } = places;

        element = new PlaceAutocompleteElement();
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(element);

        element.addEventListener('gmp-select', async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
          onSelectRef.current({
            name: place.displayName,
            address: place.formattedAddress,
            placeId: place.id,
            lat: place.location?.lat(),
            lng: place.location?.lng(),
          });
        });

        // Best-effort auto-confirm from a shared caption's name/address.
        // A miss (no match, wrong match) just leaves the widget above for
        // manual search — it never blocks the form or shows an error.
        if (autoQuery) {
          try {
            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: autoQuery });
            const top = suggestions?.[0]?.placePrediction;
            if (top && !cancelled) {
              const place = top.toPlace();
              await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
              if (!cancelled) {
                onSelectRef.current({
                  name: place.displayName,
                  address: place.formattedAddress,
                  placeId: place.id,
                  lat: place.location?.lat(),
                  lng: place.location?.lng(),
                });
              }
            }
          } catch (err) {
            console.error('Auto place search failed:', err);
          }
        }
        if (!cancelled) setAutoSearching(false);
      })
      .catch((err) => setError(err.message));

    return () => { cancelled = true; };
  }, [autoQuery]);

  if (error) {
    return <div className="oembed-hint">Address lookup unavailable: {error}</div>;
  }

  return (
    <>
      <div ref={containerRef} className="places-autocomplete-mount" />
      {autoSearching && <div className="oembed-hint" style={{ marginTop: 6 }}>Looking up the place…</div>}
    </>
  );
}
