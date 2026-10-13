// "Open in navigation" for a point (2026-10, the owner's rule): NexaMap's own
// site/app, the destination pinned - never a third-party map site. The link
// format is the super admin's (map settings, {lat} {lng} {name}); until it is
// set, the default nexamap.ir link (backend); our route page only when the
// map config cannot be read.
// coordinates are GeoJSON [lng, lat].
export const navigationUrl = (
  coordinates?: number[] | null,
  name?: string,
  template?: string | null,
  // the visitor's own point when they shared it: NexaMap then opens the
  // route itself (?from=…&to=…) instead of only the pinned destination
  origin?: { lat: number; lng: number } | null
): string | undefined => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return undefined;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (template && /^https:\/\//i.test(template)) {
    if (origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng) && /nexamap\.ir\/\?ll=\{lat\},\{lng\}$/i.test(template))
      return `https://nexamap.ir/?from=${origin.lat},${origin.lng}&to=${lat},${lng}`;
    return template
      .replace(/\{lat\}/g, String(lat))
      .replace(/\{lng\}/g, String(lng))
      .replace(/\{name\}/g, encodeURIComponent((name || "").slice(0, 80)));
  }
  const q = new URLSearchParams({ to: `${lat},${lng}` });
  if (name) q.set("name", name.slice(0, 80));
  return `/map/route?${q.toString()}`;
};
