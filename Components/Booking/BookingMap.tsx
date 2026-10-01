import classes from "./BookingMap.module.css";
import { Dispatch, Fragment, SetStateAction, useMemo, useRef } from "react";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

import useMap from "../Hooks/useMap";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import MapMarker from "../UI/MapMarker";
import DoctorTooltip from "./DoctorTooltip";
import Button from "../UI/Button";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import {
  setUserLocation,
  useTravelText,
  useTravelTimes,
  useUserLocation,
} from "../Map/mapHooks";

const NS: ContentNamespace[] = ["common", "booking"];

const BookingMap = ({
  expanded,
  setExpanded,
}: {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, bounds, flyToMe, ready } = useMap({
    containerRef,
  });

  const getContent = useScopedLocale(NS);

  const { data } = useSWR<{ doctors: IDoctorProfile[] }>(
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

  // drive time from the visitor, once their location is known
  const me = useUserLocation();
  const text = useTravelText();
  const doctors = useMemo(
    () => (Array.isArray(data?.doctors) ? data.doctors : []),
    [data],
  );
  const travelPlaces = useMemo(
    () => doctors.map((d) => ({ id: d._id, coordinates: d.location?.coordinates })),
    [doctors],
  );
  const travelTimes = useTravelTimes(me.point, travelPlaces);

  return (
    <div className={`${classes.container} ${expanded ? classes.expanded : ""}`}>
      <Button
        onClick={() => setExpanded((prev) => !prev)}
        className={classes.expand}
      >
        {getContent("searchByMap")}
      </Button>
      <div className={classes.main} ref={containerRef}>
        {ready && (
          <Fragment>
            {doctors.map((doctor) => (
              <Fragment key={doctor._id}>
                {doctor.location?.coordinates?.length === 2 && (
                  <MapMarker
                    lat={doctor.location.coordinates[1]}
                    lng={doctor.location.coordinates[0]}
                    map={map}
                    variant="doctor"
                    tooltip={
                      <DoctorTooltip
                        node={doctor}
                        travel={
                          typeof travelTimes?.[doctor._id] === "number"
                            ? getContent("mapTravelTimeByCar", [
                                text.duration(travelTimes?.[doctor._id]),
                              ])
                            : undefined
                        }
                      />
                    }
                  />
                )}
              </Fragment>
            ))}
          </Fragment>
        )}
        <button
          type="button"
          onClick={() =>
            flyToMe()
              .then((pos) => {
                if (pos)
                  setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  });
              })
              .catch(() => {})
          }
          className={classes.fly}
        >
          <Ixon width="2rem">
            <LocationIcon />
          </Ixon>
        </button>
      </div>
    </div>
  );
};

export default BookingMap;
