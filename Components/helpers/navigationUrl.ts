// "Open in navigation" for a point (2026-10, the owner's rule): NexaMap's own
// site/app, the destination pinned - never a third-party map site. The link
// format is the super admin's (map settings, {lat} {lng} {name}); until it is
// set, our own route page on NexaMap (app/map/route).
// coordinates are GeoJSON [lng, lat].
export const navigationUrl = (
  coordinates?: number[] | null,
  name?: string,
  template?: string | null
): string | undefined => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return undefined;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (template && /^https:\/\//i.test(template))
    return template
      .replace(/\{lat\}/g, String(lat))
      .replace(/\{lng\}/g, String(lng))
      .replace(/\{name\}/g, encodeURIComponent((name || "").slice(0, 80)));
  const q = new URLSearchParams({ to: `${lat},${lng}` });
  if (name) q.set("name", name.slice(0, 80));
  return `/map/route?${q.toString()}`;
};
