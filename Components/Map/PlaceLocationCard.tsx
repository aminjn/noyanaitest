"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import mlgl from "maplibre-gl";
import classes from "./PlaceLocationCard.module.css";
import useMap from "../Hooks/useMap";
import MapMarker from "../UI/MapMarker";
import Ixon from "../UI/Ixon";
import Button from "../UI/Button";
import LocationIcon from "../Icons/LocationIcon";
import SendIcon from "../Icons/SendIcon";
import WarningIcon from "../Icons/WarningIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import ClockIcon from "../Icons/ClockIcon";
import LocationMarkIcon from "../Icons/LocationMarkIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { WithStyleProps } from "../Layout/Layout";
import { tbaseBold, tsmMedium, tsmRegular, txsMedium, txsRegular } from "../UI/Typography";
import { navigationUrl } from "../helpers/navigationUrl";
import {
  AirQuality,
  decodePolyline,
  exportRouteUrl,
  getMapConfig,
  LatLng,
  placeInfo,
  route as findRoute,
  Route,
  staticMapUrl,
  toLatLng,
  TravelMode,
  tripCost,
} from "./nexamap";
import {
  fitToCoordinates,
  useGeoJsonOverlay,
  useSiteTheme,
  useTravelText,
  useUserLocation,
} from "./mapHooks";

const NS: ContentNamespace[] = ["common", "medicalCenterLocation", "drProfile"];

// "How to get there" for every public provider page (doctor office, clinic,
// hospital, para-clinic, pharmacy, insurance): a light static map that
// opens the interactive one, the address, the traffic zone, parking, air
// quality and a route from the visitor's location. Every part hides itself
// when its data is missing or the map service is down.

const ROUTE_MODES: TravelMode[] = ["car", "motorcycle", "pedestrian"];
const modeKey: Record<string, ContentKey> = {
  car: "mapModeCar",
  motorcycle: "mapModeMotorcycle",
  pedestrian: "mapModePedestrian",
};

// US EPA AQI bands; the category text from the provider is Persian only,
// so the band is shown from the number in the visitor's language.
const aqiBand = (value: number): { key: ContentKey; tone: string } => {
  if (value <= 50) return { key: "mapAqiGood", tone: classes.aqiGood };
  if (value <= 100) return { key: "mapAqiModerate", tone: classes.aqiModerate };
  if (value <= 150) return { key: "mapAqiSensitive", tone: classes.aqiSensitive };
  if (value <= 200) return { key: "mapAqiUnhealthy", tone: classes.aqiUnhealthy };
  if (value <= 300) return { key: "mapAqiVeryUnhealthy", tone: classes.aqiVeryUnhealthy };
  return { key: "mapAqiHazardous", tone: classes.aqiHazardous };
};

const ROUTE_LAYERS = [
  {
    id: "place-route-casing",
    type: "line" as const,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 },
  },
  {
    id: "place-route-line",
    type: "line" as const,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#2d7bf4", "line-width": 5 },
  },
];

const InteractiveMap = ({
  center,
  routeLine,
  origin,
}: {
  center: LatLng;
  routeLine: [number, number][] | null;
  origin: LatLng | null;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, ready } = useMap({
    containerRef,
    center: [center.lng, center.lat],
  });

  const routeData = useMemo<GeoJSON.Feature | null>(
    () =>
      routeLine && routeLine.length > 1
        ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeLine } }
        : null,
    [routeLine],
  );
  useGeoJsonOverlay(map, ready, "place-route", routeData, ROUTE_LAYERS);

  useEffect(() => {
    if (!map || !ready || !routeLine?.length) return;
    fitToCoordinates(map, [...routeLine, [center.lng, center.lat]]);
  }, [map, ready, routeLine, center]);

  // the visitor's own position, a plain dot
  useEffect(() => {
    if (!map || !ready || !origin) return;
    const el = document.createElement("div");
    el.className = classes.meDot;
    const marker = new mlgl.Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, ready, origin]);

  return (
    <div className={classes.map} ref={containerRef}>
      {ready && <MapMarker lat={center.lat} lng={center.lng} map={map} variant="active" />}
    </div>
  );
};

const PlaceLocationCard = ({
  coords,
  name,
  address,
  title,
  className = "",
  style,
  id,
  autoRoute = false,
}: WithStyleProps<{
  // GeoJSON [lng, lat], as stored on our models
  coords?: number[] | null;
  name?: string;
  address?: string;
  // section title (defaults to "How to get there")
  title?: string;
  id?: string;
  // the route page (/map/route): the route from the visitor is asked for
  // at once, and the "open" button is not shown (we are there)
  autoRoute?: boolean;
}>) => {
  const getContent = useScopedLocale(NS);
  const text = useTravelText();
  const theme = useSiteTheme();
  // by value: callers often pass a fresh array on every render
  const lng0 = Array.isArray(coords) ? coords[0] : undefined;
  const lat0 = Array.isArray(coords) ? coords[1] : undefined;
  const center = useMemo(() => toLatLng([lng0, lat0]), [lng0, lat0]);

  const { data: config } = useSWR("nexamap-config", () => getMapConfig());
  const { data: info } = useSWR(
    center ? ["nexamap-place-info", center.lat, center.lng] : null,
    () => placeInfo(center!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  // the live map loads as soon as the card comes into view (the owner's
  // rule: a map, not a picture to tap); the static image only holds the
  // place until then
  const [interactive, setInteractive] = useState(autoRoute);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (interactive) return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInteractive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInteractive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [interactive]);
  const staticAllowed = config ? config.enabled && config.features?.staticMap !== false : true;
  const showInteractive = interactive || (!!config && !staticAllowed);

  // --- route from the visitor ---
  const me = useUserLocation();
  const [mode, setMode] = useState<TravelMode>("car");
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState<"location" | "route" | null>(null);
  const [routes, setRoutes] = useState<Partial<Record<TravelMode, Route | null>>>({});
  const [fuel, setFuel] = useState<Partial<Record<TravelMode, number>>>({});
  const [gpxBusy, setGpxBusy] = useState(false);
  const routeAllowed = !config || (config.enabled && config.features?.route !== false);

  const loadRoute = async (nextMode: TravelMode) => {
    if (!center) return;
    setMode(nextMode);
    setRouteError(null);
    if (routes[nextMode]) return;
    setRouting(true);
    const origin = await me.request();
    if (!origin) {
      setRouting(false);
      setRouteError("location");
      return;
    }
    try {
      const res = await findRoute({ waypoints: [origin, center], mode: nextMode });
      const list = Array.isArray(res?.routes) ? res.routes : [];
      const best = list.find((r) => r?.primary) || list[0] || null;
      if (!best?.summary) throw new Error("no route");
      setRoutes((prev) => ({ ...prev, [nextMode]: best }));
      setInteractive(true);
      // fuel for motor vehicles, when the route didn't price it
      if (nextMode !== "pedestrian" && !best.summary.fuel_cost_irr)
        tripCost({
          distance_m: best.summary.distance_m,
          duration_s: best.summary.duration_s,
          mode: nextMode,
        })
          .then((c) => {
            if (c?.fuel_cost_irr) setFuel((prev) => ({ ...prev, [nextMode]: c.fuel_cost_irr }));
          })
          .catch(() => {});
    } catch {
      setRoutes((prev) => ({ ...prev, [nextMode]: null }));
      setRouteError("route");
    } finally {
      setRouting(false);
    }
  };

  // the route page asks for the way there at once (the browser asks the
  // visitor for their location once)
  const autoAsked = useRef(false);
  useEffect(() => {
    if (!autoRoute || !center || autoAsked.current || !routeAllowed) return;
    autoAsked.current = true;
    loadRoute("car");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRoute, center, routeAllowed]);

  const active = routes[mode] || null;
  const routeLine = useMemo(() => {
    if (!active?.geometry) return null;
    try {
      const line = decodePolyline(active.geometry);
      return line.every((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])) ? line : null;
    } catch {
      return null;
    }
  }, [active]);

  const downloadGpx = async () => {
    if (!center || !me.point || gpxBusy) return;
    setGpxBusy(true);
    try {
      // a file, not JSON: the gateway answers with the GPX itself
      const res = await fetch(exportRouteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waypoints: [me.point, center],
          format: "gpx",
          mode,
          name: (name || "route").slice(0, 120),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "route.gpx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setRouteError("route");
    } finally {
      setGpxBusy(false);
    }
  };

  const navUrl = autoRoute ? undefined : navigationUrl(coords || undefined, name);
  const shownAddress = address || info?.address || "";
  const parkingInfo = info?.parking && info.parking.count > 0 ? info.parking : null;
  const nearestParking = useMemo(() => {
    const items = Array.isArray(parkingInfo?.items) ? parkingInfo!.items : [];
    return [...items]
      .filter((p) => typeof p?.distance_m === "number")
      .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0))[0];
  }, [parkingInfo]);
  const air: AirQuality | null =
    info?.airQuality && typeof info.airQuality.value === "number" ? info.airQuality : null;

  if (!center && !address) return null;

  const summary = active?.summary;
  const crossesZone =
    !!summary?.traffic_zone_cost_irr ||
    (Array.isArray(active?.restrictions_violated) &&
      active!.restrictions_violated!.some((r) => r?.type === "traffic_zone"));
  const fuelIrr = summary?.fuel_cost_irr || fuel[mode];

  return (
    <section ref={sectionRef} className={`${classes.main} ${className}`} style={style} id={id}>
      <div className={classes.header}>
        <div className={`${classes.iconBox} glassIcon tone-rose`}>
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
        </div>
        <div className={classes.headerText}>
          <span className={`${classes.legend} ${tsmRegular}`}>
            {title || getContent("mapHowToGetThere")}
          </span>
          {!!name && <span className={`${classes.name} ${tbaseBold}`}>{name}</span>}
        </div>
        {!!navUrl && (
          <Button
            tailIcon={<SendIcon />}
            variant="Primary"
            mode="Fill"
            size="S"
            radius="High"
            onClick={() => window.open(navUrl, "_blank", "noopener")}
            // our route page on NexaMap (Components/Map/RoutePage.tsx)
          >
            {getContent("mapOpenInNavApp")}
          </Button>
        )}
      </div>

      {!!center &&
        (showInteractive ? (
          <InteractiveMap center={center} routeLine={routeLine} origin={active ? me.point : null} />
        ) : (
          <button
            type="button"
            className={classes.staticMap}
            onClick={() => setInteractive(true)}
            aria-label={getContent("mapTapForInteractive")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={staticMapUrl({ center, zoom: 16, width: 720, height: 280, dark: theme === "dark" })}
              alt={getContent("mapStaticAlt", [name || shownAddress || ""])}
              loading="lazy"
              decoding="async"
              width={720}
              height={280}
              onError={() => setInteractive(true)}
            />
            <span className={`${classes.staticHint} ${txsMedium}`}>
              {getContent("mapTapForInteractive")}
            </span>
          </button>
        ))}

      <div className={classes.body}>
        {!!shownAddress && (
          <div className={classes.address}>
            <Ixon className={classes.addressIcon} width=".875rem">
              <LocationIcon />
            </Ixon>
            <div className={classes.addressText}>
              <p className={tsmRegular}>{shownAddress}</p>
              {!address && !!info?.address && (
                <span className={`${classes.muted} ${txsRegular}`}>
                  {getContent("mapApproxAddress")}
                </span>
              )}
            </div>
          </div>
        )}

        {!!info?.trafficZone && (
          <div className={`${classes.notice} ${classes.warning}`} role="note">
            <Ixon width="1rem">
              <WarningIcon />
            </Ixon>
            <div>
              <p className={tsmMedium}>{getContent("mapInTrafficZone")}</p>
              <p className={txsRegular}>{getContent("mapTrafficZoneHint")}</p>
            </div>
          </div>
        )}

        {(!!parkingInfo || !!air) && (
          <div className={classes.facts}>
            {!!parkingInfo && (
              <div className={classes.fact}>
                <span className={classes.parkingBadge} aria-hidden>
                  P
                </span>
                <div className={classes.factText}>
                  <span className={tsmMedium}>
                    {getContent("mapParkingNearby", [text.num(parkingInfo.count)])}
                  </span>
                  {!!nearestParking && (
                    <span className={`${classes.muted} ${txsRegular}`}>
                      {getContent("mapNearestParking", [
                        nearestParking.name || getContent("mapParking"),
                        text.distance(nearestParking.distance_m),
                      ])}
                      {typeof nearestParking.fee === "boolean" &&
                        ` · ${getContent(nearestParking.fee ? "mapParkingPaid" : "mapParkingFree")}`}
                    </span>
                  )}
                </div>
              </div>
            )}
            {!!air && (
              <div className={classes.fact}>
                <span className={`${classes.aqiDot} ${aqiBand(air.value as number).tone}`}>
                  {text.num(air.value as number)}
                </span>
                <div className={classes.factText}>
                  <span className={tsmMedium}>{getContent("mapAirQuality")}</span>
                  <span className={`${classes.muted} ${txsRegular}`}>
                    {getContent(aqiBand(air.value as number).key)}
                    {typeof air.source === "string" &&
                      air.source.startsWith("estimate") &&
                      ` · ${getContent("mapAqiEstimate")}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {!!center && routeAllowed && (
          <div className={classes.route}>
            {!active && (
              <Button
                variant="Secondary"
                mode="Outline"
                size="M"
                radius="High"
                leadIcon={<LocationMarkIcon />}
                isLoading={routing}
                onClick={() => loadRoute("car")}
              >
                {getContent("mapRouteFromMyLocation")}
              </Button>
            )}

            {!!active && (
              <div className={classes.modes} role="tablist">
                {ROUTE_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    className={`${classes.chip} ${txsMedium} ${mode === m ? classes.chipActive : ""}`}
                    onClick={() => loadRoute(m)}
                    disabled={routing}
                  >
                    {getContent(modeKey[m])}
                  </button>
                ))}
              </div>
            )}

            {!!summary && (
              <div className={classes.summary}>
                <div className={classes.summaryMain}>
                  <Ixon width="1rem">
                    <ClockIcon />
                  </Ixon>
                  <span className={tbaseBold}>{text.duration(summary.duration_s)}</span>
                  <span className={`${classes.muted} ${tsmRegular}`}>
                    {text.distance(summary.distance_m)}
                  </span>
                </div>
                <div className={`${classes.summaryRows} ${txsRegular}`}>
                  {!!summary.arrival_time && (
                    <span>{getContent("mapArriveAt", [text.clock(summary.arrival_time)])}</span>
                  )}
                  {!!summary.traffic_zone_cost_irr && (
                    <span>
                      {getContent("mapTrafficZoneCost", [text.toman(summary.traffic_zone_cost_irr)])}
                    </span>
                  )}
                  {mode !== "pedestrian" && !!fuelIrr && (
                    <span>{getContent("mapFuelCost", [text.toman(fuelIrr)])}</span>
                  )}
                </div>
                {crossesZone && mode !== "pedestrian" && (
                  <span className={`${classes.inlineWarning} ${txsMedium}`}>
                    {getContent("mapRouteEntersTrafficZone")}
                  </span>
                )}
                <div className={classes.routeActions}>
                  <Button
                    variant="Neutral"
                    mode="Outline"
                    size="S"
                    radius="High"
                    leadIcon={<DownloadIcon />}
                    isLoading={gpxBusy}
                    onClick={downloadGpx}
                  >
                    {getContent("mapDownloadGpx")}
                  </Button>
                </div>
              </div>
            )}

            {routing && !!active && (
              <span className={`${classes.muted} ${txsRegular}`}>{getContent("mapRouting")}</span>
            )}
            {routeError === "location" && (
              <span className={`${classes.muted} ${txsRegular}`}>{getContent("mapLocationDenied")}</span>
            )}
            {routeError === "route" && (
              <span className={`${classes.muted} ${txsRegular}`}>{getContent("mapRouteFailed")}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlaceLocationCard;
