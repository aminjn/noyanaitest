import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import mlgl from "maplibre-gl";
import { booleanPointInPolygon } from "@turf/turf";
import { LatLng, matrix, toLatLng, TravelMode } from "./nexamap";
import useScopedLocale from "../Hooks/useScopedLocale";
import { useIntlLocale } from "../i18n/navigation";
import { readTheme, Theme } from "../UI/Theme/theme";

// Small shared pieces of the public map features (provider location card,
// the map page, the booking maps, "leave by"): the visitor's location, a
// GeoJSON overlay that survives theme switches, travel-time text, and a
// travel-time lookup. Every part degrades to "nothing shown" on failure.

// --- the visitor's location (one per page, shared by every map) ---

export type UserLocationStatus = "idle" | "loading" | "ok" | "denied" | "unsupported";
type UserLocationState = { status: UserLocationStatus; point: LatLng | null };

let locationState: UserLocationState = { status: "idle", point: null };
let pending: Promise<LatLng | null> | null = null;
const listeners = new Set<() => void>();
const emit = (next: UserLocationState) => {
  locationState = next;
  listeners.forEach((l) => l());
};

export const setUserLocation = (point: LatLng) => emit({ status: "ok", point });

// Asks the browser once; later calls reuse the answer (or the request in
// flight). Never throws: null means "not available".
export const requestUserLocation = (force = false): Promise<LatLng | null> => {
  if (!force && locationState.status === "ok") return Promise.resolve(locationState.point);
  if (pending) return pending;
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    emit({ status: "unsupported", point: null });
    return Promise.resolve(null);
  }
  emit({ status: "loading", point: locationState.point });
  pending = new Promise<LatLng | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        emit({ status: "ok", point });
        resolve(point);
      },
      () => {
        emit({ status: "denied", point: null });
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }).finally(() => {
    pending = null;
  });
  return pending;
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const serverSnapshot: UserLocationState = { status: "idle", point: null };

export const useUserLocation = () => {
  const state = useSyncExternalStore(
    subscribe,
    () => locationState,
    () => serverSnapshot,
  );
  return { ...state, request: requestUserLocation };
};

// --- GeoJSON overlays ---

export type OverlayLayer = {
  id: string;
  type: "line" | "fill" | "circle";
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  filter?: unknown;
};

// Draws `data` as the given layers and keeps it drawn: the map's style is
// replaced when the site theme switches (useMap), which drops custom
// layers, so they are put back after every style change. null removes it.
export const useGeoJsonOverlay = (
  map: mlgl.Map | null,
  ready: boolean,
  id: string,
  data: GeoJSON.FeatureCollection | GeoJSON.Feature | null,
  layers: OverlayLayer[],
) => {
  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    if (!map || !ready) return;
    const remove = () => {
      try {
        for (const l of layersRef.current) if (map.getLayer(l.id)) map.removeLayer(l.id);
        if (map.getSource(id)) map.removeSource(id);
      } catch {
        // map already gone
      }
    };
    if (!data) {
      remove();
      return;
    }
    const add = () => {
      try {
        const source = map.getSource(id) as mlgl.GeoJSONSource | undefined;
        if (source) source.setData(data);
        else map.addSource(id, { type: "geojson", data });
        for (const l of layersRef.current)
          if (!map.getLayer(l.id))
            map.addLayer({ ...l, source: id } as unknown as mlgl.AddLayerObject);
      } catch {
        // style still loading: the styledata listener below retries
      }
    };
    add();
    const onStyle = () => {
      if (!map.getSource(id) || layersRef.current.some((l) => !map.getLayer(l.id))) add();
    };
    map.on("styledata", onStyle);
    return () => {
      map.off("styledata", onStyle);
    };
  }, [map, ready, id, data]);

  // gone with the component
  useEffect(
    () => () => {
      if (!map) return;
      try {
        for (const l of layersRef.current) if (map.getLayer(l.id)) map.removeLayer(l.id);
        if (map.getSource(id)) map.removeSource(id);
      } catch {
        // map already removed
      }
    },
    [map, id],
  );
};

export const fitToCoordinates = (map: mlgl.Map | null, coords: [number, number][], padding = 48) => {
  if (!map || !coords.length) return;
  try {
    const bounds = new mlgl.LngLatBounds(coords[0], coords[0]);
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { padding, maxZoom: 16, duration: 600 });
  } catch {
    // bad geometry: leave the view as it is
  }
};

// [lng, lat] inside any polygon of a FeatureCollection
export const isInsideAny = (coords: [number, number], fc?: GeoJSON.FeatureCollection | null) => {
  if (!fc || !Array.isArray(fc.features)) return false;
  return fc.features.some((f) => {
    const g = f?.geometry;
    if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) return false;
    try {
      return booleanPointInPolygon(coords, g);
    } catch {
      return false;
    }
  });
};

// --- text ---

export const useTravelText = () => {
  const getContent = useScopedLocale();
  const intl = useIntlLocale();
  return useMemo(() => {
    const num = (n: number, digits = 0) =>
      new Intl.NumberFormat(intl, { maximumFractionDigits: digits }).format(n);
    const duration = (seconds?: number | null) => {
      if (typeof seconds !== "number" || !Number.isFinite(seconds)) return "";
      const minutes = Math.max(1, Math.round(seconds / 60));
      if (minutes < 60) return getContent("xMinutes", [num(minutes)]);
      return getContent("mapXHoursYMinutes", [num(Math.floor(minutes / 60)), num(minutes % 60)]);
    };
    const distance = (meters?: number | null) => {
      if (typeof meters !== "number" || !Number.isFinite(meters)) return "";
      if (meters < 1000) return getContent("mapXMeters", [num(Math.round(meters / 10) * 10)]);
      return getContent("xKM", [num(meters / 1000, meters < 10000 ? 1 : 0)]);
    };
    const clock = (value?: string | Date | null) => {
      if (!value) return "";
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString(intl, { hour: "2-digit", minute: "2-digit" });
    };
    // NexaMap amounts are in rials; the site shows toman
    const toman = (irr?: number | null) => {
      if (typeof irr !== "number" || !Number.isFinite(irr) || irr <= 0) return "";
      return getContent("xToman", [num(Math.round(irr / 10))]);
    };
    return { duration, distance, clock, toman, num };
  }, [getContent, intl]);
};

// --- travel times from the visitor to many places ---

const MATRIX_LIMIT = 50;

// Seconds from `origin` to each destination (by id), at most 50 places per
// request (the gateway's limit). Unknown / unreachable places are left out.
export const useTravelTimes = (
  origin: LatLng | null,
  places: { id: string; coordinates?: unknown }[],
  mode: TravelMode = "car",
) => {
  const key = useMemo(() => {
    const valid = places
      .map((p) => ({ id: p.id, point: toLatLng(p.coordinates) }))
      .filter((p): p is { id: string; point: LatLng } => !!p.point)
      .slice(0, MATRIX_LIMIT);
    return { valid, signature: valid.map((v) => `${v.id}:${v.point.lat.toFixed(4)},${v.point.lng.toFixed(4)}`).join("|") };
  }, [places]);

  const cache = useRef<Record<string, Record<string, number>>>({});
  const [, setTick] = useState(0);
  const originKey = origin ? `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}:${mode}` : "";
  const requestKey = originKey && key.signature ? `${originKey}#${key.signature}` : "";

  useEffect(() => {
    if (!requestKey || !origin || cache.current[requestKey]) return;
    let cancelled = false;
    matrix([origin], key.valid.map((v) => v.point), mode)
      .then((res) => {
        if (cancelled) return;
        const row = Array.isArray(res?.durations?.[0]) ? res.durations[0] : [];
        const out: Record<string, number> = {};
        key.valid.forEach((v, i) => {
          const s = row[i];
          if (typeof s === "number" && Number.isFinite(s)) out[v.id] = s;
        });
        cache.current[requestKey] = out;
        setTick((t) => t + 1);
      })
      .catch(() => {
        // no travel times: the list just isn't sorted
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return requestKey ? cache.current[requestKey] || null : null;
};

// The site theme (light / dark), following the theme toggle.
export const useSiteTheme = (): Theme => {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(readTheme());
    const onTheme = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next === "light" || next === "dark") setTheme(next);
    };
    window.addEventListener("noyan-theme", onTheme);
    return () => window.removeEventListener("noyan-theme", onTheme);
  }, []);
  return theme;
};
