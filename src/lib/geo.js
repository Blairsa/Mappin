/**
 * Turns a real lat/lng into an x/y percentage for the constellation panel.
 * This is a plain equirectangular projection over the whole world — the
 * constellation is a stylised "journey" view, not a literal map, so exact
 * cartographic accuracy doesn't matter here, just a stable, sensible
 * placement instead of the previous random one.
 */
export function latLngToPercent(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(94, Math.max(6, y)) };
}
