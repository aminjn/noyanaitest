import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// Typed client of the site's NexaMap gateway (backend /api/v1/map,
// Controllers/mapController.ts). The browser never talks to NexaMap and
// never sees the key: tiles, search, addresses, routes and live layers all
// go through our API. Coordinates follow NexaMap: {lat, lng} objects; a
// GeoJSON pair in our models is [lng, lat] (see toLatLng).

export type LatLng = { lat: number; lng: number };

export const NEXAMAP_ATTRIBUTION = "© NexaMap، © OpenStreetMap contributors";

export const toLatLng = (coords?: unknown): LatLng | null => {
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lng, lat] = coords.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
};
export const toCoordinates = (p: LatLng): [number, number] => [p.lng, p.lat];

type Envelope<T> = { data: T; meta?: { attribution?: string } };

const get = async <T>(path: string, query: Record<string, unknown> = {}): Promise<T> => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((item) => params.append(k, String(item)));
    else params.set(k, String(v));
  }
  const qs = params.toString();
  const res = (await fetcher({ url: `${API}/map/${path}${qs ? `?${qs}` : ""}` })) as Envelope<T>;
  return res.data;
};

const post = async <T>(path: string, payload: object): Promise<T> => {
  const res = (await fetcher({
    url: `${API}/map/${path}`,
    method: "POST",
    payload: payload as { [key: string]: unknown },
    bodyParser: "JSON",
  })) as Envelope<T>;
  return res.data;
};

// --- config ---

export type MapConfig = {
  enabled: boolean;
  provider: "nexamap";
  styles: { light: string; dark: string } | null;
  features: Record<
    "search" | "reverse" | "route" | "isochrone" | "traffic" | "parking" | "airQuality" | "staticMap",
    boolean
  >;
};

let configPromise: Promise<MapConfig | null> | null = null;
// One request per page load; a failure means "not available" (the map
// falls back to a plain base layer), never a crash.
export const getMapConfig = () => {
  if (!configPromise)
    configPromise = get<MapConfig>("config").catch(() => {
      configPromise = null;
      return null;
    });
  return configPromise;
};

// --- search and addresses ---

export type Prediction = {
  place_id: string;
  type?: "poi" | "street" | "neighborhood" | "city" | "address" | string;
  main_text: string;
  secondary_text?: string;
  category?: { id?: string; title?: string };
  location?: LatLng;
  distance_m?: number;
};

export const autocomplete = (q: string, opts: { near?: LatLng | null; sessionToken?: string; limit?: number } = {}) =>
  get<{ predictions: Prediction[]; session_token?: string }>("autocomplete", {
    q,
    lat: opts.near?.lat,
    lng: opts.near?.lng,
    session_token: opts.sessionToken,
    limit: opts.limit,
  });

export type GeocodeResult = {
  place_id?: string;
  formatted_address?: string;
  components?: Record<string, string>;
  location: LatLng;
  entrance_point?: LatLng;
  routing_point?: LatLng;
  match_level?: string;
  confidence?: number;
};

export const geocode = (address: string) =>
  get<{ results: GeocodeResult[] }>("geocode", { address }).then((d) => d.results || []);

export type ReverseResult = {
  place_id?: string;
  formatted_address?: string;
  components?: Record<string, string>;
  plus_code?: string;
  extras?: { timezone?: string; in_traffic_zone?: string };
};

export const reverseGeocode = (p: LatLng) =>
  get<{ results: ReverseResult[] }>("reverse", p).then((d) => d.results?.[0] ?? null);

export type SearchResult = {
  place_id: string;
  name: string;
  category?: { id?: string; path?: string[] };
  location: LatLng;
  address?: Record<string, string>;
  distance_m?: number;
  status?: string;
};

export const searchPlaces = (q: { q?: string; near?: LatLng; radius?: number; limit?: number }) =>
  get<{ results: SearchResult[] }>("search", {
    q: q.q,
    lat: q.near?.lat,
    lng: q.near?.lng,
    radius: q.radius,
    limit: q.limit,
  }).then((d) => d.results || []);

// --- divisions ---

export type Division = { id: string; name: string; name_en?: string | null; admin_level?: string };

export const resolveDivisions = (p: LatLng) =>
  get<{ province: Division | null; city: Division | null; district: Division | null }>("divisions/resolve", p);

// --- routing ---

export type TravelMode = "car" | "motorcycle" | "truck" | "bike" | "pedestrian";

export type Route = {
  summary: {
    distance_m: number;
    duration_s: number;
    departure_time?: string;
    arrival_time?: string;
    departure_time_jalali?: string;
    arrival_time_jalali?: string;
    route_label?: string;
    fuel_liters?: number;
    co2_grams?: number;
    fuel_cost_irr?: number;
    toll_cost_irr?: number;
    total_cost_irr?: number;
    traffic_zone_cost_irr?: number;
  };
  geometry: string;
  legs?: { steps?: { instruction?: string }[] }[];
  restrictions_violated?: { type?: string; from?: number; to?: number }[];
  primary?: boolean;
  confidence?: "high" | "low" | string;
};

export const route = (body: {
  waypoints: LatLng[];
  mode?: TravelMode;
  avoid?: ("toll" | "highway" | "tunnel" | "unpaved" | "ferry" | "traffic_zone")[];
  depart_at?: string;
  prefer?: "fastest" | "fuel" | "risk" | "comfort";
}) => post<{ routes: Route[]; waypoint_order?: number[] }>("route", body);

export const exportRouteUrl = `${API}/map/route/export`;

export const matrix = (sources: LatLng[], destinations: LatLng[], mode: TravelMode = "car") =>
  post<{ distances: (number | null)[][]; durations: (number | null)[][] }>("matrix", {
    sources,
    destinations,
    mode,
  });

export type IsochroneGeoJson = {
  type: "FeatureCollection";
  features: { type: "Feature"; properties: Record<string, unknown>; geometry: GeoJSON.Polygon }[];
};

export const isochrone = (origin: LatLng, opts: { minutes?: number; km?: number; mode?: TravelMode }) =>
  post<{ geojson: IsochroneGeoJson; origin: LatLng }>("isochrone", { origin, ...opts });

export const tripCost = (body: { waypoints?: LatLng[]; distance_m?: number; duration_s?: number; mode?: TravelMode }) =>
  post<{ fuel_liters?: number; co2_grams?: number; fuel_cost_irr?: number; avg_kmh?: number }>("trip-cost", body);

// --- live layers and place intelligence ---

export type BBox = { minlat: number; minlng: number; maxlat: number; maxlng: number };

export const trafficFlow = (b: BBox) =>
  get<{ geojson: GeoJSON.FeatureCollection; count: number; source?: string }>("traffic/flow", b);

export const trafficZones = () =>
  get<{
    geojson: GeoJSON.FeatureCollection;
    status?: Record<string, { active_today?: boolean; hours?: string }>;
  }>("traffic-zones");

export const parking = (p: LatLng, radius?: number) =>
  get<{
    count: number;
    total_capacity?: number;
    items: { name?: string; capacity?: number; type?: string; fee?: boolean; distance_m?: number; lat?: number; lng?: number }[];
  }>("parking", { ...p, radius });

export type AirQuality = { value: number | null; category: string | null; source: string | null; confidence: number | null };

export const airQuality = (p: LatLng) => get<AirQuality & { pm25?: number }>("air-quality", p);

export type PlaceInfo = {
  address: string | null;
  plusCode: string | null;
  trafficZone: string | null;
  parking: {
    count: number;
    totalCapacity: number | null;
    items: { name?: string; capacity?: number; type?: string; fee?: boolean; distance_m?: number }[];
  } | null;
  airQuality: AirQuality | null;
};

// address, traffic zone, parking and air quality of one point, in one call
export const placeInfo = (p: LatLng) => get<PlaceInfo>("place-info", p);

// A static map image URL (cards, lists): served and cached by our API.
export const staticMapUrl = (opts: {
  center: LatLng;
  zoom?: number;
  width?: number;
  height?: number;
  dark?: boolean;
  markerColor?: string;
}) => {
  const params = new URLSearchParams({
    center: `${opts.center.lat},${opts.center.lng}`,
    zoom: String(opts.zoom ?? 15),
    width: String(opts.width ?? 600),
    height: String(opts.height ?? 300),
    scale: "2",
    format: "webp",
  });
  if (opts.dark) params.set("style", "night");
  params.append("marker", `color:${opts.markerColor || "purple"}|${opts.center.lat},${opts.center.lng}`);
  return `${API}/map/staticmap?${params.toString()}`;
};

// Decode a NexaMap polyline (precision 6) to GeoJSON [lng, lat] pairs.
export const decodePolyline = (encoded: string, precision = 6): [number, number][] => {
  const factor = 10 ** precision;
  const out: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const which of [0, 1]) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < encoded.length + 1);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += delta;
      else lng += delta;
    }
    out.push([lng / factor, lat / factor]);
  }
  return out;
};

export const newSessionToken = () =>
  `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
