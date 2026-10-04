// A stored point may be missing, `[]` or garbage (an old record): only a
// real [lng, lat] pair counts as a value. Kept apart from the map components so a form
// can read a point without loading the map library (maplibre, ~1 MB).
export const asPoint = (value?: unknown): [number, number] | null =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((n) => typeof n === "number" && Number.isFinite(n))
    ? [value[0], value[1]]
    : null;
