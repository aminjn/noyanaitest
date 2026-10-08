"use client";
import { ReactNode, useMemo, useRef, useState } from "react";
import OpenStatusBadge from "../OpeningHours/OpenStatusBadge";
import { OpenStatus } from "../OpeningHours/openingHours";
import useMap from "../Hooks/useMap";
import classes from "./MapPage.module.css";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import PillIcon from "../Icons/PillIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import Link from "@/Components/i18n/Link";
import HostedImage from "../UI/HostedImage";
import Button from "../UI/Button";
import { ContentKey } from "../Enums/contentKeys";
import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { tlgMedium, tsmMedium, tsmRegular } from "../UI/Typography";
import MapMarkers from "./MapMarkers";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import MapTools from "./MapTools";
import PlaceSearch from "./PlaceSearch";
import { useIntlLocale } from "../i18n/navigation";
import { IsochroneGeoJson } from "./nexamap";
import { isInsideAny, useTravelText, useTravelTimes, useUserLocation } from "./mapHooks";

const LOCALE_NS: ContentNamespace[] = ["common", "mapPage"];

export const mapFilters = [
  "doctors",
  "clinics",
  "labs",
  "hospitals",
  "pharmacies",
] as const;

export type MapFilter = (typeof mapFilters)[number];

export const filterIcon: Record<MapFilter, ReactNode> = {
  doctors: <StetoscopeIcon />,
  clinics: <BuildingIcon />,
  pharmacies: <PillIcon />,
  hospitals: <HospitalIcon />,
  labs: <FlaskIcon />,
};

export const filterContentKeys: Record<MapFilter, ContentKey> = {
  doctors: "doctor",
  clinics: "clinic",
  labs: "lab",
  hospitals: "hospital",
  pharmacies: "pharmacy",
};

// a centre on the map (2026-10): clinics, hospitals, labs and pharmacies are
// layers next to the doctors, each pin and row opening the centre's page
export type MapPlaceLayer = Exclude<MapFilter, "doctors">;
export type MapPlace = {
  _id: string;
  name?: string;
  slug?: string;
  image?: string;
  address?: string;
  isRoundTheClock?: boolean;
  // open now / closes at (2026-10, backend Lib/openingHours.ts)
  openStatus?: OpenStatus | null;
  kind?: MapPlaceLayer;
  city?: { name?: string } | null;
  province?: { name?: string } | null;
  location?: { coordinates?: [number, number] };
};
const placeLayers: MapPlaceLayer[] = ["clinics", "labs", "hospitals", "pharmacies"];
export const placePath: Record<MapPlaceLayer, string> = {
  clinics: "/clinic",
  hospitals: "/hospital",
  labs: "/paraClinic",
  pharmacies: "/pharmacy",
};
const hasPoint = (c: unknown): c is [number, number] =>
  Array.isArray(c) && c.length === 2 && c.every((n) => typeof n === "number" && Number.isFinite(n));

const MapPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapHook = useMap({
    containerRef,
  });

  const { bounds } = mapHook;

  // "reachable within N minutes": the area the visitor can drive to
  const [reachable, setReachable] = useState<IsochroneGeoJson | null>(null);

  const [filters, setFilters] = useState<MapFilter[]>(["doctors"]);

  // only the layers switched on are asked for (in a stable order, so a
  // toggle back reuses the cached answer)
  const layers = useMemo(() => mapFilters.filter((f) => filters.includes(f)), [filters]);
  const { data } = useSWR<
    {
      doctors: IDoctorProfile<{
        MainSpecialityPopulated: Record<never, never>;
      }>[];
    } & Partial<Record<MapPlaceLayer, MapPlace[]>>
  >(
    bounds && layers.length
      ? {
          url: `${API}/public/map`,
          payload: { bounds: bounds.toArray(), layers },
        }
      : null,
    (args: {
      url: string;
      payload: { bounds: [[number, number], [number, number]]; layers: MapFilter[] };
    }) => fetcher({ ...args, method: "POST" }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const getContent = useScopedLocale(LOCALE_NS);
  const text = useTravelText();
  const me = useUserLocation();
  const intlTag = useIntlLocale();

  const inReach = (c: unknown) =>
    !reachable || (hasPoint(c) && isInsideAny(c, reachable as GeoJSON.FeatureCollection));

  // the doctors in view, limited to the reachable area when one is set
  const doctors = useMemo(() => {
    const list = filters.includes("doctors") && Array.isArray(data?.doctors) ? data.doctors : [];
    return list.filter((d) => !!d?._id && inReach(d?.location?.coordinates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reachable, filters]);

  // the centres of every layer switched on, same rule
  const places = useMemo(
    () =>
      placeLayers
        .filter((layer) => filters.includes(layer))
        .flatMap((layer) =>
          (Array.isArray(data?.[layer]) ? (data?.[layer] as MapPlace[]) : [])
            .filter((p) => !!p?._id && hasPoint(p.location?.coordinates) && inReach(p.location?.coordinates))
            .map((p) => ({ ...p, kind: layer })),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, reachable, filters],
  );
  const countOf = (filter: MapFilter) =>
    filter === "doctors" ? doctors.length : places.filter((p) => p.kind === filter).length;

  // drive time from the visitor to each visible pin (at most 50)
  const travelPlaces = useMemo(
    () => [
      ...doctors.map((d) => ({ id: d._id, coordinates: d.location?.coordinates })),
      ...places.map((p) => ({ id: p._id, coordinates: p.location?.coordinates })),
    ],
    [doctors, places],
  );
  const travelTimes = useTravelTimes(me.point, travelPlaces);
  const sortedDoctors = useMemo(() => {
    if (!travelTimes) return doctors;
    const t = (id: string) => (typeof travelTimes[id] === "number" ? travelTimes[id] : Infinity);
    return [...doctors].sort((a, b) => t(a._id) - t(b._id));
  }, [doctors, travelTimes]);
  const sortedPlaces = useMemo(() => {
    if (!travelTimes) return places;
    const t = (id: string) => (typeof travelTimes[id] === "number" ? travelTimes[id] : Infinity);
    return [...places].sort((a, b) => t(a._id) - t(b._id));
  }, [places, travelTimes]);
  const total = doctors.length + places.length;

  return (
    <div className={classes.main}>
      <div className={classes.intro}>
        <h1 className={`${classes.mainTitle} ${tlgMedium}`}>
          {getContent("mapTitle")}
        </h1>
        <span className={`${classes.mainDescription} ${tsmRegular}`}>
          {getContent("mapLegend")}
        </span>
      </div>
      <div className={classes.header}>
        {/* an address / place (NexaMap autocomplete) or a province / city /
            district (our zones) */}
        <PlaceSearch
          near={me.point || { lat: mapHook.center.lat, lng: mapHook.center.lng }}
          placeholder={getContent("mapSearchPlaceholder")}
          noResults={getContent("nothingWasFound")}
          errorText={getContent("mapSearchUnavailable")}
          locale={intlTag}
          onPick={(pick) =>
            mapHook.map?.flyTo({ center: [pick.location.lng, pick.location.lat], zoom: 15 })
          }
        />
        <div className={classes.filters}>
          {mapFilters.map((filter) => (
            <Button
              type="button"
              key={filter}
              onClick={() =>
                setFilters((prev) => {
                  const clone = [...prev];
                  if (clone.includes(filter)) {
                    clone.splice(clone.indexOf(filter), 1);
                  } else {
                    clone.push(filter);
                  }
                  return clone;
                })
              }
              leadIcon={filterIcon[filter]}
              size="M"
              radius="High"
              mode="Fill"
              variant={filters.includes(filter) ? "Secondary" : "Disable"}
            >
              <div className={classes.filterContent}>
                {getContent(filterContentKeys[filter])}
                {filters.includes(filter) && !!countOf(filter) && (
                  <span className={classes.glass}>{new Intl.NumberFormat(intlTag).format(countOf(filter))}</span>
                )}
              </div>
            </Button>
          ))}
        </div>
        <MapTools
          map={mapHook.map}
          ready={mapHook.ready}
          bounds={bounds}
          zoom={mapHook.zoom}
          onReachableChange={setReachable}
        />
      </div>
      <div className={classes.content}>
        <div className={classes.map} ref={containerRef}>
          <MapMarkers
            {...mapHook}
            data={{ doctors, places }}
            travelTimes={travelTimes}
          />
        </div>
        <div className={classes.resultsBox}>
          {/* the real number of results in view, every layer switched on */}
          <span className={`${classes.resultsTitle} ${tsmMedium}`}>
            {`${getContent("results")} (${new Intl.NumberFormat(intlTag).format(total)})`}
          </span>
          {!!total && (
            <span className={`${classes.toolsHint} ${tsmRegular}`}>
              {travelTimes
                ? getContent("mapSortedByTravelTime")
                : getContent("mapShareLocationForTimes")}
            </span>
          )}
          <div className={classes.results}>
            {filters.includes("doctors") &&
              sortedDoctors.map((doctor) => (
                <div key={doctor._id} className={classes.resultItem}>
                  {typeof travelTimes?.[doctor._id] === "number" && (
                    <span className={`${classes.travelChip} ${tsmMedium}`}>
                      {getContent("mapTravelTimeByCar", [text.duration(travelTimes?.[doctor._id])])}
                    </span>
                  )}
                  <DoctorCardAlt
                    variant="row"
                    node={doctor as Parameters<typeof DoctorCardAlt>[0]["node"]}
                  />
                </div>
              ))}
            {sortedPlaces.map((place) => (
              <div key={`${place.kind}-${place._id}`} className={classes.resultItem}>
                {typeof travelTimes?.[place._id] === "number" && (
                  <span className={`${classes.travelChip} ${tsmMedium}`}>
                    {getContent("mapTravelTimeByCar", [text.duration(travelTimes?.[place._id])])}
                  </span>
                )}
                <Link
                  href={`${placePath[place.kind || "clinics"]}/${encodeURIComponent(place.slug || place._id)}`}
                  className={classes.item}
                >
                  <span className={classes.itemImage}>
                    <HostedImage src={place.image} alt={place.name || ""} fill sizes="3rem" style={{ objectFit: "cover" }} />
                  </span>
                  <span className={classes.itemContent}>
                    <span className={`${classes.itemTitle} ${tsmMedium}`}>{place.name}</span>
                    <span className={`${classes.itemDescription} ${tsmRegular}`}>
                      {[getContent(filterContentKeys[place.kind || "clinics"]), place.city?.name || place.province?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {!!place.address && (
                      <span className={`${classes.itemDescription} ${tsmRegular}`}>{place.address}</span>
                    )}
                    <OpenStatusBadge status={place.openStatus} compact />
                  </span>
                  {place.kind === "pharmacies" && !!place.isRoundTheClock && !place.openStatus && (
                    <span className={`${classes.travelChip} ${tsmMedium}`}>{getContent("roundTheClock")}</span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
