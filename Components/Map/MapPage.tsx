"use client";
import { ReactNode, useRef, useState } from "react";
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
                {filter === "doctors" && !!data?.doctors?.length && (
                  <span className={classes.glass}>{data.doctors.length}</span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.map} ref={containerRef}>
          <MapMarkers {...mapHook} data={data} />
        </div>
        <div className={classes.resultsBox}>
          {/* only doctors are on the map for now; the count is the real
              number of results in view (it was a fixed "20") */}
          <span className={`${classes.resultsTitle} ${tsmMedium}`}>
            {`${getContent("results")} (${filters.includes("doctors") ? data?.doctors?.length || 0 : 0})`}
          </span>
          <div className={classes.results}>
            {filters.includes("doctors") &&
              (Array.isArray(data?.doctors) ? data.doctors : []).map((doctor) => (
                <DoctorCardAlt
                  key={doctor._id}
                  variant="row"
                  node={doctor as Parameters<typeof DoctorCardAlt>[0]["node"]}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
