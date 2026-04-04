// ─── Haversine Distance Utility ───────────────────────────────────────────────
// Port of the same algorithm used in the web frontend.
// Returns the great-circle distance between two coordinates in kilometres.

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate the Haversine distance between two lat/lng points.
 * @param lat1 Latitude of point A (degrees)
 * @param lng1 Longitude of point A (degrees)
 * @param lat2 Latitude of point B (degrees)
 * @param lng2 Longitude of point B (degrees)
 * @returns Distance in kilometres
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Returns distance in metres.
 */
export function haversineMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return haversineKm(lat1, lng1, lat2, lng2) * 1000;
}
