"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./MapTools.module.css";
import { UseMapReturns } from "../Hooks/useMap";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { txsMedium, txsRegular } from "../UI/Typography";
import { BBox, getMapConfig, isochrone, IsochroneGeoJson, trafficFlow, trafficZones } from "./nexamap";
import { fitToCoordinates, OverlayLayer, useGeoJsonOverlay, useTravelText, useUserLocation } from "./mapHooks";

const NS: ContentNamespace[] = ["common", "mapPage"];

// Extra layers of the public map: "reachable within N minutes" from the
// visitor (NexaMap isochrone), live traffic for the visible area and the
// traffic-restriction zones. Each one is off by default, and hides itself
// when the map service says the feature is off.

const MINUTES = [10, 20, 30] as const;

const ISO_LAYERS: OverlayLayer[] = [
  { id: "iso-fill", type: "fill", paint: { "fill-color": "#2d7bf4", "fill-opacity": 0.12 } },
  { id: "iso-line", type: "line", paint: { "line-color": "#2d7bf4", "line-width": 2 } },
];
const TRAFFIC_LAYERS: OverlayLayer[] = [
  {
    id: "traffic-line",
    type: "line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": ["coalesce", ["get", "color"], "#9e9e9e"],
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 5],
      "line-opacity": 0.85,
    },
  },
];
const ZONE_LAYERS: OverlayLayer[] = [
  { id: "zones-fill", type: "fill", paint: { "fill-color": "#e53935", "fill-opacity": 0.08 } },
  {
    id: "zones-line",
    type: "line",
    paint: { "line-color": "#e53935", "line-width": 2, "line-dasharray": [2, 2] },
  },
];

// rounded so small pans reuse the same request (and the gateway's cache)
const roundedBox = (bounds: UseMapReturns["bounds"]): BBox | null => {
  if (!bounds) return null;
  const r = (n: number) => Math.round(n * 100) / 100;
  try {
    return {
      minlat: r(bounds.getSouth()),
      minlng: r(bounds.getWest()),
      maxlat: r(bounds.getNorth()),
      maxlng: r(bounds.getEast()),
    };
  } catch {
    return null;
  }
};

const MapTools = ({
  map,
  ready,
  bounds,
  zoom,
  onReachableChange,
}: Pick<UseMapReturns, "map" | "ready" | "bounds" | "zoom"> & {
  onReachableChange: (area: IsochroneGeoJson | null) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const text = useTravelText();
  const me = useUserLocation();
  const { data: config } = useSWR("nexamap-config", () => getMapConfig());
  const features = config?.enabled ? config.features : null;

  // --- reachable within N minutes ---
  const [minutes, setMinutes] = useState<number | null>(null);
  const [area, setArea] = useState<IsochroneGeoJson | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<"location" | "layer" | null>(null);

  const pickMinutes = async (value: number | null) => {
    setFailed(null);
    setMinutes(value);
    if (value === null) {
      setArea(null);
      onReachableChange(null);
      return;
    }
    setBusy(true);
    const origin = await me.request();
    if (!origin) {
      setBusy(false);
      setMinutes(null);
      setFailed("location");
      return;
    }
    try {
      const res = await isochrone(origin, { minutes: value, mode: "car" });
      const fc = res?.geojson;
      if (!fc || !Array.isArray(fc.features) || !fc.features.length) throw new Error("empty");
      setArea(fc);
      onReachableChange(fc);
      const ring = fc.features[0]?.geometry?.coordinates?.[0];
      if (Array.isArray(ring)) fitToCoordinates(map, ring as [number, number][]);
    } catch {
      setMinutes(null);
      setArea(null);
      onReachableChange(null);
      setFailed("layer");
    } finally {
      setBusy(false);
    }
  };
  useGeoJsonOverlay(map, ready, "iso", area as GeoJSON.FeatureCollection | null, ISO_LAYERS);

  // --- live traffic ---
  const [showTraffic, setShowTraffic] = useState(false);
  const box = useMemo(() => roundedBox(bounds), [bounds]);
  // a whole-country view would be a huge request: only from city zoom in
  const trafficKey = showTraffic && box && zoom >= 10 ? ["nexamap-traffic", box.minlat, box.minlng, box.maxlat, box.maxlng] : null;
  const { data: traffic, error: trafficError } = useSWR(trafficKey, () => trafficFlow(box as BBox), {
    keepPreviousData: true,
    refreshInterval: 120_000,
    shouldRetryOnError: false,
  });
  const trafficData =
    showTraffic && traffic?.geojson && Array.isArray(traffic.geojson.features) ? traffic.geojson : null;
  useGeoJsonOverlay(map, ready, "traffic", trafficData, TRAFFIC_LAYERS);

  // --- traffic zones ---
  const [showZones, setShowZones] = useState(false);
  const { data: zones, error: zonesError } = useSWR(showZones ? "nexamap-traffic-zones" : null, () => trafficZones(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const zonesData = showZones && zones?.geojson && Array.isArray(zones.geojson.features) ? zones.geojson : null;
  useGeoJsonOverlay(map, ready, "zones", zonesData, ZONE_LAYERS);

  useEffect(() => {
    if (trafficError || zonesError) setFailed("layer");
  }, [trafficError, zonesError]);

  const showReach = !features || features.isochrone !== false;
  const showTrafficToggles = !features || features.traffic !== false;
  if (!showReach && !showTrafficToggles) return null;

  return (
    <div className={classes.main}>
      {showReach && (
        <div className={classes.group} role="group" aria-label={getContent("mapReachableWithin")}>
          <span className={`${classes.label} ${txsMedium}`}>{getContent("mapReachableWithin")}</span>
          <button
            type="button"
            className={`${classes.chip} ${txsMedium} ${minutes === null ? classes.active : ""}`}
            onClick={() => pickMinutes(null)}
            aria-pressed={minutes === null}
          >
            {getContent("mapAnyDistance")}
          </button>
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              className={`${classes.chip} ${txsMedium} ${minutes === m ? classes.active : ""}`}
              onClick={() => pickMinutes(m)}
              aria-pressed={minutes === m}
              disabled={busy}
            >
              {text.duration(m * 60)}
            </button>
          ))}
        </div>
      )}
      {showTrafficToggles && (
        <div className={classes.group}>
          <button
            type="button"
            className={`${classes.chip} ${txsMedium} ${showTraffic ? classes.active : ""}`}
            onClick={() => setShowTraffic((v) => !v)}
            aria-pressed={showTraffic}
          >
            <span className={`${classes.swatch} ${classes.trafficSwatch}`} aria-hidden />
            {getContent("mapTrafficLayer")}
          </button>
          <button
            type="button"
            className={`${classes.chip} ${txsMedium} ${showZones ? classes.active : ""}`}
            onClick={() => setShowZones((v) => !v)}
            aria-pressed={showZones}
          >
            <span className={`${classes.swatch} ${classes.zoneSwatch}`} aria-hidden />
            {getContent("mapTrafficZonesLayer")}
          </button>
        </div>
      )}
      {showTraffic && zoom < 10 && (
        <span className={`${classes.note} ${txsRegular}`}>{getContent("mapZoomInForTraffic")}</span>
      )}
      {failed === "location" && (
        <span className={`${classes.note} ${txsRegular}`}>{getContent("mapLocationDenied")}</span>
      )}
      {failed === "layer" && (
        <span className={`${classes.note} ${txsRegular}`}>{getContent("mapLayerUnavailable")}</span>
      )}
    </div>
  );
};

export default MapTools;
