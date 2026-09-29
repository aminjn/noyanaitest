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
  map,
  lat,
  lng,
}: {
  mode: MapFilter;
  title: string;
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
    <Fragment>
      <div style={{ display: "none" }}>
        <div className={classes.marker} ref={markerRef}>
          <Ixon width="1.125rem">{filterIcon[mode]}</Ixon>
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
}: {
  data?: { doctors?: IDoctorProfile[] };
} & UseMapReturns) => {
  const [isMeLoading, setIsMeLoading] = useState<boolean>(false);

  const [me, setMe] = useState<[number, number] | null>();

  return (
    <Fragment>
      {ready && (
        <Fragment>
          {!!map && (
            <Fragment>
              {data?.doctors?.map((doctor) => (
                <Fragment key={doctor._id}>
                  {doctor.location?.coordinates && (
                    <MapMarker
                      mode="doctors"
                      title={getDoctorProfileLabel(doctor)}
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
              const mine = await flyToMe();
              setIsMeLoading(false);
              setMe([mine.coords.longitude, mine.coords.latitude]);
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
