// "Open in navigation" for a point (2026-10, the owner's rule): our own
// route page on NexaMap (app/map/route), the destination pinned and the
// way there from the visitor drawn - never a third-party map site.
// coordinates are GeoJSON [lng, lat].
export const navigationUrl = (coordinates?: number[] | null, name?: string): string | undefined => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return undefined;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  const q = new URLSearchParams({ to: `${lat},${lng}` });
  if (name) q.set("name", name.slice(0, 80));
  return `/map/route?${q.toString()}`;
};
