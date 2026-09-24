import classes from "./BookingMap.module.css";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
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
            {data?.doctors.map((doctor) => (
              <Fragment key={doctor._id}>
                {doctor.location?.coordinates && (
                  <MapMarker
                    lat={doctor.location.coordinates[1]}
                    lng={doctor.location.coordinates[0]}
                    map={map}
                    variant="doctor"
                    tooltip={<DoctorTooltip node={doctor} />}
                  />
                )}
              </Fragment>
            ))}
          </Fragment>
        )}
        <button onClick={() => flyToMe()} className={classes.fly}>
          <Ixon width="2rem">
            <LocationIcon />
          </Ixon>
        </button>
      </div>
    </div>
  );
};

export default BookingMap;
