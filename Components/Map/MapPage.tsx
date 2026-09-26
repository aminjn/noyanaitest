"use client";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import useMap from "../Hooks/useMap";
import classes from "./MapPage.module.css";
import Input from "../UI/Input";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
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
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import mlgl from "maplibre-gl";
import {
  t2xsMedium,
  tlgMedium,
  tsmMedium,
  tsmRegular,
  txsDemiBold,
} from "../UI/Typography";
import StarIcon from "../Icons/StarIcon";
import Link from "@/Components/i18n/Link";
import LocationMarkIcon from "../Icons/LocationMarkIcon";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Admin/Province/AdminManageProvincesPage";
import LoadingIcon from "../Icons/LoadingIcon";
import MapInnerShit from "./MapInnerShit";
import SearchZones from "./SearchZones";
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

const ResultItem = ({
  mode,
  title,
  description,
  target,
  score,
}: {
  mode: MapFilter;
  title: string;
  description?: string;
  target: string;
  score?: number;
}) => {
  return (
    <Link className={classes.item} href={target}>
      <div className={classes.itemIcon}>
        <Ixon width="1rem">{filterIcon[mode]}</Ixon>
      </div>
      <div className={classes.itemContent}>
        <span className={`${classes.itemTitle} ${txsDemiBold}`}>{title}</span>
        {!!description && (
          <span className={`${classes.itemDescription} ${t2xsMedium}`}>
            {description}
          </span>
        )}
      </div>
      {typeof score === "number" && (
        <div className={classes.itemScore}>
          <span>{score.toFixed(1)}</span>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
        </div>
      )}
    </Link>
  );
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
                <span className={classes.glass}>8</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.map} ref={containerRef}>
          <MapInnerShit {...mapHook} data={data} />
        </div>
        <div className={classes.resultsBox}>
          <span
            className={`${classes.resultsTitle} ${tsmMedium}`}
          >{`${getContent("results")} (${20})`}</span>
          <div className={classes.results}>
            {data?.doctors.map((doctor) => (
              <ResultItem
                mode="doctors"
                title={getDoctorProfileLabel(doctor)}
                key={doctor._id}
                description={doctor.mainSpeciality?.name}
                target={`/dr/${doctor.slug || doctor._id}`}
                score={doctor.averageScore}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
