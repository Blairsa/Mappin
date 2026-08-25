import { Loader } from '@googlemaps/js-api-loader';

/**
 * As of March 1 2025, Google stopped issuing the legacy
 * google.maps.places.Autocomplete / PlacesService to new API keys — new
 * projects (which is what you'll be creating) only get the newer
 * PlaceAutocompleteElement + Place classes. The code that uses this loader
 * is written against that current API on purpose, not the older pattern
 * you'll find in a lot of tutorials.
 * https://developers.google.com/maps/documentation/javascript/places-migration-overview
 *
 * One loader instance is shared across the app; importLibrary() calls for
 * the same library are cached internally, so calling loadGoogleMaps() and
 * loadGoogleMapsCore() from different components doesn't reload anything.
 */
let loader = null;

function getLoader() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set — see .env.example');
  }
  if (!loader) loader = new Loader({ apiKey, version: 'weekly' });
  return loader;
}

/** Places library — Autocomplete + Place details. */
export function loadGoogleMaps() {
  return getLoader().importLibrary('places');
}

/** Core map + marker classes, for rendering an actual map. */
export async function loadGoogleMapsCore() {
  const [mapsLib, markerLib] = await Promise.all([
    getLoader().importLibrary('maps'),
    getLoader().importLibrary('marker'),
  ]);
  return { ...mapsLib, ...markerLib };
}
