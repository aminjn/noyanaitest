import "maplibre-gl/dist/maplibre-gl.css";
import mlgl, { LngLat, LngLatBounds } from "maplibre-gl";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import useNotification from "./useNotification";
import { IPolygon } from "../Admin/Province/AdminManageProvincesPage";
import useScopedLocale from "./useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { getMapConfig, NEXAMAP_ATTRIBUTION } from "../Map/nexamap";
import { readTheme, Theme } from "../UI/Theme/theme";

const LOCALE_NS: ContentNamespace[] = ["common", "mapPage"];

// Browser only, and never fatal: on the server (SSR) maplibre has no
// worker ("No actors found") and a blocked CDN must not take the page down.
if (typeof window !== "undefined")
  try {
    Promise.resolve(
      mlgl.setRTLTextPlugin(
        "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
        true,
      ),
    ).catch(() => {});
  } catch {
    // already set (hot reload) or unavailable
  }

export type UseMapProps = {
  containerRef: RefObject<HTMLDivElement>;
  center?: [number, number];
  onClick?: (e: LngLat) => void;
};

export type UseMapReturns = ReturnType<typeof useMap>;

// The base map is NexaMap (Components/Map/nexamap.ts): its MapLibre style,
// light or dark with the site theme, served through our API so the key
// stays on the server. A deploy may still point at another style through
// the env (a mirror, a dev server).
const ENV_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "";

// Used when the style above can't be fetched (tile host down or blocked,
// offline dev): a plain background plus OSM raster tiles. The map, its
// markers and clicks keep working even if the tiles never arrive, so a
// location picker is never an empty box.
const FALLBACK_STYLE: mlgl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#eef1f5" },
    },
    { id: "osm", type: "raster", source: "osm" },
  ],
};

// How long the platform style gets before the fallback replaces it.
const STYLE_TIMEOUT_MS = 8000;

const DEFAULT_CENTER: [number, number] = [51.389, 35.689];

// A stored point may be missing, `[]`, or garbage: maplibre throws on a
// NaN LngLat, so anything that isn't a [lng, lat] pair inside Iran's box
// falls back to Tehran.
const validCenter = (value?: unknown): [number, number] => {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    value[0] >= 44 &&
    value[0] <= 63.5 &&
    value[1] >= 24 &&
    value[1] <= 40
  )
    return [value[0], value[1]];
  return DEFAULT_CENTER;
};

const useMap = ({
  containerRef,
  center: rawCenter,
  onClick,
}: UseMapProps) => {
  const initialCenter = validCenter(rawCenter);
  const mapRef = useRef<mlgl.Map | null>(null);
  // the latest handler, so a click never calls a stale closure from the
  // first render
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const [bounds, setBounds] = useState<mlgl.LngLatBounds | null>(null);
  const [center, setCenter] = useState<LngLat>(new LngLat(...initialCenter));
  const [zoom, setZoom] = useState<number>(13);

  const [ready, setReady] = useState<boolean>(false);

  const pushNotification = useNotification();
  const getContent = useScopedLocale(LOCALE_NS);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mlgl.Map({
      container: containerRef.current,
      // the real style is set below once the map config is known
      style: FALLBACK_STYLE,
      center: initialCenter,
      maxBounds: [
        [44.0, 24.0],
        [63.5, 40.0],
      ],
      zoom: 13,
      attributionControl: false,
    });
    // NexaMap's terms: its attribution shows on every map
    map.addControl(
      new mlgl.AttributionControl({
        compact: true,
        customAttribution: NEXAMAP_ATTRIBUTION,
      }),
      document.documentElement.dir === "rtl" ? "bottom-left" : "bottom-right",
    );
    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    setBounds(map.getBounds());
    setCenter(map.getCenter());
    setZoom(map.getZoom());
    map.on("moveend", () => {
      setBounds(map.getBounds());
      setCenter(map.getCenter());
      setZoom(map.getZoom());
    });
    map.on("click", (e) => {
      onClickRef.current?.(e.lngLat);
    });
    map.on("load", () => {
      setReady(true);
    });
    map.on("style.load", () => {
      setReady(true);
    });
    // NexaMap's style for the current theme; the plain base layer stays if
    // it can't load (key not set yet, provider down) - never an empty box.
    let usingFallback = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const switchToFallback = () => {
      if (usingFallback || mapRef.current !== map) return;
      usingFallback = true;
      map.setStyle(FALLBACK_STYLE);
    };
    const styleFor = async (theme: Theme) => {
      if (ENV_STYLE_URL) return ENV_STYLE_URL;
      const config = await getMapConfig();
      return config?.enabled && config.styles ? config.styles[theme] : null;
    };
    const applyStyle = async (theme: Theme) => {
      const url = await styleFor(theme);
      if (!url || mapRef.current !== map) return;
      usingFallback = false;
      clearTimeout(timer);
      map.setStyle(url);
      timer = setTimeout(() => {
        if (!map.isStyleLoaded()) switchToFallback();
      }, STYLE_TIMEOUT_MS);
      map.once("style.load", () => clearTimeout(timer));
    };
    applyStyle(readTheme());
    map.on("error", () => {
      if (!usingFallback && !map.isStyleLoaded()) switchToFallback();
    });
    // the site theme switched: the map follows (day / night style)
    const onTheme = (e: Event) => {
      const theme = (e as CustomEvent<Theme>).detail;
      if (theme === "light" || theme === "dark") applyStyle(theme);
    };
    window.addEventListener("noyan-theme", onTheme);
    // the container may get its size after the map (a tab that just
    // opened): keep the canvas in step with it
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => map.resize())
        : null;
    observer?.observe(containerRef.current);
    map.once("remove", () => {
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("noyan-theme", onTheme);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setReady(false);
      }
    };
  }, []);

  const flyToMe = useCallback(
    async (_zoom: number = 17) => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        const current = mapRef.current;
        if (!current)
          return pushNotification(getContent("mapIsNotReady"), "Warn");
        if (!navigator.geolocation)
          return pushNotification(
            getContent("yourDeviceNotSupportingGPS"),
            "Error",
          );
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            current.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: _zoom || zoom,
            });
            resolve(pos);
          },
          (err) => {
            console.log(err);
            pushNotification(
              getContent("somethingWentWrongAcquiringYourLocation"),
              "Error",
            );
            reject();
          },
          { enableHighAccuracy: true },
        );
      });
    },
    [getContent, pushNotification, zoom],
  );

  const flyTo = useCallback(
    (zoom: number = 17) => {
      const current = mapRef.current;
      if (!current)
        return pushNotification(getContent("mapIsNotReady"), "Warn");
      if (!navigator.geolocation)
        return pushNotification(
          getContent("yourDeviceNotSupportingGPS"),
          "Error",
        );
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom,
          });
        },
        (err) => {
          console.log(err);
          pushNotification(
            getContent("somethingWentWrongAcquiringYourLocation"),
            "Error",
          );
        },
        { enableHighAccuracy: true },
      );
    },
    [getContent, pushNotification],
  );

  const fitBounds = useCallback((polygon: IPolygon) => {
    const current = mapRef.current;
    if (!current) return;
    const bounds = new LngLatBounds();
    polygon.coordinates[0].forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });
    current.fitBounds(bounds);
  }, []);

  return {
    map: mapRef.current,
    bounds,
    center,
    flyToMe,
    ready,
    fitBounds,
    zoom,
  };
};

export default useMap;
