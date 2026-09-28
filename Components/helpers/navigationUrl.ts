// Turn-by-turn link for a point, on Neshan (an Iranian map service, so it
// works without international services). coordinates are GeoJSON [lng, lat].
export const navigationUrl = (coordinates?: number[] | null): string | undefined => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return undefined;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return `https://neshan.org/maps/@${lat},${lng},16z,0p`;
};
