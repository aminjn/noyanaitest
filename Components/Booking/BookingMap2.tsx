import { Fragment, useEffect, useRef, useState } from "react";
import classes from "./BookingMap2.module.css";
import useMap from "../Hooks/useMap";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import MapMarker from "../UI/MapMarker";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import PopupCard from "../UI/PopupCard";
import SearchZones from "../Map/SearchZones";
import MapInnerShit from "../Map/MapInnerShit";
import Button from "../UI/Button";
import { LngLat } from "maplibre-gl";
import { TerraDraw, TerraDrawCircleMode, TerraDrawPointMode } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { bbox, circle } from "@turf/turf";
import usePopup from "../Hooks/usePopup";

const NS: ContentNamespace[] = ["common", "booking"];

const SEARCH_RADIUS = 1;

const generateCircleFeature = ({
  coords,
  radius,
}: {
  coords: [number, number];
  radius: number;
}) => {
  const feature = circle(coords, radius, { units: "kilometers" });
  return {
    raw: feature,
    parsed: {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: [
          feature.geometry.coordinates[0].map(([lat, lng]) => [
            Number(lat.toFixed(9)),
            Number(lng.toFixed(9)),
          ]),
        ],
      },
      properties: { mode: "circle", radiusKilometers: radius },
    },
  };
};

const radiuses = [1, 5, 10, 25, 50] as const;

const BookingMap2 = ({
  defaultValue,
  onApply,
}: {
  defaultValue?: { coords: [number, number]; radius: number };
  onApply: (e: { coords: [number, number]; radius: number }) => unknown;
}) => {
  const [selected, setSelected] = useState<LngLat | null>(
    defaultValue?.coords ? new LngLat(...defaultValue.coords) : null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const mapHook = useMap({
    containerRef,
    onClick: setSelected,
    center: defaultValue?.coords,
  });

  const [selectedRadius, setSelectedRadius] = useState<number>(
    defaultValue?.radius || radiuses[0],
  );

  const [terra, setTerra] = useState<TerraDraw | null>(null);

  const { map, ready } = mapHook;

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

  useEffect(() => {
    if (!map || !ready || !!terra) return;
    const td = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawCircleMode({
          projection: "web-mercator",
        }),
      ],
    });
    td.start();
    setTerra(td);

    if (!!defaultValue) {
      const feature = generateCircleFeature(defaultValue);
      const bounds = bbox(feature.raw);
      td.addFeatures([feature.parsed]);
      map.fitBounds([
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ]);
    }
  }, [defaultValue, map, ready, terra]);

  useEffect(() => {
    if (!terra || !selected || !map) return;
    terra.clear();
    const feature = generateCircleFeature({
      coords: selected.toArray(),
      radius: selectedRadius,
    });
    const bounds = bbox(feature.raw);
    terra.addFeatures([feature.parsed]);
    map.fitBounds([
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ]);
  }, [map, selected, selectedRadius, terra]);

  const getContent = useScopedLocale(NS);

  const getCompContent = getContent;

  const { closePopup } = usePopup();

  return (
    <PopupCard icon={<LocationIcon />} title={getContent("geospetialPositoin")}>
      <div className={classes.main}>
        <SearchZones onSelect={fitBounds} />
        <div className={classes.radiusPicker}>
          {radiuses.map((rad) => (
            <Button
              key={rad}
              variant={selectedRadius === rad ? "Primary" : "Neutral"}
              size="S"
              mode="Fill"
              onClick={() => setSelectedRadius(rad)}
            >
              {getCompContent("xKM", [rad.toString()])}
            </Button>
          ))}
        </div>
        <div className={classes.map} ref={containerRef}>
          <MapInnerShit {...mapHook} data={data} />
        </div>
        <Button
          variant={selected ? "Primary" : "Disable"}
          mode="Fill"
          radius="High"
          size="L"
          onClick={() => {
            if (!selected) return;
            onApply({ coords: selected.toArray(), radius: selectedRadius });
            closePopup();
          }}
        >
          {getContent("applyFilter")}
        </Button>
      </div>
    </PopupCard>
  );
};

export default BookingMap2;
