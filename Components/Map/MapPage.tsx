"use client";
import { ReactNode, useMemo, useRef, useState } from "react";
import useMap from "../Hooks/useMap";
import classes from "./MapPage.module.css";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import PillIcon from "../Icons/PillIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import Button from "../UI/Button";
import { ContentKey } from "../Enums/contentKeys";
import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { tlgMedium, tsmMedium, tsmRegular } from "../UI/Typography";
import MapMarkers from "./MapMarkers";
import SearchZones from "./SearchZones";
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
  "labs",
  "hospitals",
  "pharmacies",
] as const;

export type MapFilter = (typeof mapFilters)[number];

export const filterIcon: Record<MapFilter, ReactNode> = {
  doctors: <StetoscopeIcon />,
  pharmacies: <PillIcon />,
  hospitals: <HospitalIcon />,
  labs: <FlaskIcon />,
};

export const filterContentKeys: Record<MapFilter, ContentKey> = {
  doctors: "doctor",
  labs: "lab",
  hospitals: "hospital",
  pharmacies: "pharmacy",
};

const MapPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapHook = useMap({
    containerRef,
  });

  const { bounds, fitBounds } = mapHook;

  // "reachable within N minutes": the area the visitor can drive to
  const [reachable, setReachable] = useState<IsochroneGeoJson | null>(null);

  const { data } = useSWR<{
    doctors: IDoctorProfile<{
      MainSpecialityPopulated: Record<never, never>;
    }>[];
  }>(
    bounds
      ? {
          url: `${API}/public/map`,
          payload: { bounds: bounds.toArray() },
        }
      : null,
    (args: {
      url: string;
      payload: { bounds: [[number, number], [number, number]] };
    }) => fetcher({ ...args, method: "POST" }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const [filters, setFilters] = useState<MapFilter[]>(["doctors"]);

  const getContent = useScopedLocale(LOCALE_NS);
  const text = useTravelText();
  const me = useUserLocation();
  const intlTag = useIntlLocale();

  // the doctors in view, limited to the reachable area when one is set
  const doctors = useMemo(() => {
    const list = Array.isArray(data?.doctors) ? data.doctors : [];
    if (!reachable) return list;
    return list.filter((d) => {
      const c = d?.location?.coordinates;
      return Array.isArray(c) && c.length === 2 && isInsideAny(c as [number, number], reachable as GeoJSON.FeatureCollection);
    });
  }, [data, reachable]);

  // drive time from the visitor to each visible doctor (at most 50)
  const travelPlaces = useMemo(
    () => doctors.map((d) => ({ id: d._id, coordinates: d.location?.coordinates })),
    [doctors],
  );
  const travelTimes = useTravelTimes(me.point, travelPlaces);
  const sortedDoctors = useMemo(() => {
    if (!travelTimes) return doctors;
    const t = (id: string) => (typeof travelTimes[id] === "number" ? travelTimes[id] : Infinity);
    return [...doctors].sort((a, b) => t(a._id) - t(b._id));
  }, [doctors, travelTimes]);

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
          placeholder={getContent("mapSearchPlace")}
          noResults={getContent("nothingWasFound")}
          errorText={getContent("mapLayerUnavailable")}
          locale={intlTag}
          onPick={(pick) =>
            mapHook.map?.flyTo({ center: [pick.location.lng, pick.location.lat], zoom: 15 })
          }
        />
        <SearchZones onSelect={fitBounds} />
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
                {filter === "doctors" && !!doctors.length && (
                  <span className={classes.glass}>{doctors.length}</span>
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
            data={{ doctors: filters.includes("doctors") ? doctors : [] }}
            travelTimes={travelTimes}
          />
        </div>
        <div className={classes.resultsBox}>
          {/* only doctors are on the map for now; the count is the real
              number of results in view (it was a fixed "20") */}
          <span className={`${classes.resultsTitle} ${tsmMedium}`}>
            {`${getContent("results")} (${filters.includes("doctors") ? doctors.length : 0})`}
          </span>
          {filters.includes("doctors") && !!doctors.length && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
