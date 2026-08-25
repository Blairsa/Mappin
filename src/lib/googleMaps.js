import { Loader } from '@googlemaps/js-api-loader';

/**
 * As of March 1 2025, Google stopped issuing the legacy
 * google.maps.places.Autocomplete / PlacesService to new API keys — new
 * projects (which is what you'll be creating) only get the newer
 * PlaceAutocompleteElement + Place classes. This loader + the components
 * that use it are written against that current API on purpose, not the
 * older pattern you'll find in a lot of tutorials.
 * https://developers.google.com/maps/documentation/javascript/places-migration-overview
 */
let loaderPromise = null;

export function loadGoogleMaps() {
  if (!loaderPromise) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set — see .env.example'));
    }
    const loader = new Loader({ apiKey, version: 'weekly' });
    loaderPromise = loader.importLibrary('places');
  }
  return loaderPromise;
}
