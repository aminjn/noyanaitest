import { Fragment, useEffect, useRef, useState } from "react";
import mlgl from "maplibre-gl";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./MapPage.module.css";
import { filterIcon, MapFilter } from "./MapPage";
import Ixon from "../UI/Ixon";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { UseMapReturns } from "../Hooks/useMap";
import LoadingIcon from "../Icons/LoadingIcon";
import LocationMarkIcon from "../Icons/LocationMarkIcon";
import { setUserLocation, useTravelText, useUserLocation } from "./mapHooks";

const SelfMarker = ({
  lat,
  lng,
  map,
}: {
  map: mlgl.Map;
  lat: number;
  lng: number;
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const markerElement = markerRef.current?.cloneNode(true) as HTMLElement;
    if (!markerElement) return;
    const marker = new mlgl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [lat, lng, map]);
  return (
    <div style={{ display: "none" }}>
      <div ref={markerRef} className={classes.selfMarker}>
        <div className={classes.selfMarkerIn} />
      </div>
    </div>
  );
};

const MapMarker = ({
  mode,
  title,
  badge,
  map,
  lat,
  lng,
}: {
  mode: MapFilter;
  title: string;
  // short text under the pin (travel time from the visitor)
  badge?: string;
  map: mlgl.Map;
  lat: number;
  lng: number;
}) => {
  const markerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const markerElement = markerRef.current?.cloneNode(true) as HTMLElement;
    if (!markerElement) return;
    const marker = new mlgl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [lat, lng, map, badge, title]);

  return (
    <Fragment>
      <div style={{ display: "none" }}>
        <div
          className={classes.marker}
          ref={markerRef}
          title={badge ? `${title} · ${badge}` : title}
        >
          <Ixon width="1.125rem">{filterIcon[mode]}</Ixon>
          {!!badge && <span className={classes.markerBadge}>{badge}</span>}
        </div>
      </div>
    </Fragment>
  );
};

const MapMarkers = ({
  data,
  ready,
  map,
  flyToMe,
  travelTimes,
}: {
  data?: { doctors?: IDoctorProfile[] };
  // doctor id -> seconds from the visitor (NexaMap matrix), when known
  travelTimes?: Record<string, number> | null;
} & UseMapReturns) => {
  const [isMeLoading, setIsMeLoading] = useState<boolean>(false);

  // shared with the rest of the page (travel times, reachable area)
  const location = useUserLocation();
  const me: [number, number] | null = location.point
    ? [location.point.lng, location.point.lat]
    : null;
  const text = useTravelText();

  return (
    <Fragment>
      {ready && (
        <Fragment>
          {!!map && (
            <Fragment>
              {(Array.isArray(data?.doctors) ? data.doctors : []).map((doctor) => (
                <Fragment key={doctor._id}>
                  {doctor.location?.coordinates?.length === 2 && (
                    <MapMarker
                      mode="doctors"
                      title={getDoctorProfileLabel(doctor)}
                      badge={text.duration(travelTimes?.[doctor._id]) || undefined}
                      lat={doctor.location.coordinates[1]}
                      lng={doctor.location.coordinates[0]}
                      map={map}
                    />
                  )}
                </Fragment>
              ))}
              {!!me && <SelfMarker map={map} lat={me[1]} lng={me[0]} />}
            </Fragment>
          )}
          <button
            className={classes.flyToMe}
            type="button"
            onClick={async () => {
              setIsMeLoading(true);
              try {
                const mine = await flyToMe();
                if (mine)
                  setUserLocation({
                    lat: mine.coords.latitude,
                    lng: mine.coords.longitude,
                  });
              } catch {
                // denied / unavailable: useMap already told the visitor
              } finally {
                setIsMeLoading(false);
              }
            }}
          >
            <Ixon width="1.5rem">
              {isMeLoading ? <LoadingIcon /> : <LocationMarkIcon />}
            </Ixon>
          </button>
        </Fragment>
      )}
    </Fragment>
  );
};

export default MapMarkers;
