import useMap from "@/Components/Hooks/useMap";
import classes from "./DoctorManageLocationTab.module.css";
import { Fragment, useRef, useState } from "react";
import { LngLat } from "maplibre-gl";
import Ixon from "@/Components/UI/Ixon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import useDoctor from "@/Components/Hooks/useDoctor";
import { API } from "@/Components/config";
import MapMarker from "@/Components/UI/MapMarker";

const DoctorManageLocationTab = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<LngLat | null>(null);

  const { doctor, mutate } = useDoctor();

  const getContent = useLocale();

  const markerRef = useRef<HTMLDivElement>(null);

  const pushNotification = useNotification();

  const [isLoading, setIsLoading] = useState<{
    location: [number, number];
  } | null>(null);

  const { map, ready } = useMap({
    containerRef: containerRef,
    onClick: setSelected,
    center: doctor?.location?.coordinates,
  });

  return (
    <div className={classes.container}>
      <div className={classes.main} ref={containerRef}>
        {ready ? (
          <Fragment>
            {doctor?.location && (
              <MapMarker
              variant="active"
                lat={doctor.location.coordinates[1]}
                lng={doctor.location.coordinates[0]}
                map={map}
              />
            )}
            {selected && (
              <MapMarker lng={selected.lng} lat={selected.lat} map={map} />
            )}
          </Fragment>
        ) : null}
        <div style={{ display: "none" }}>
          <div className={classes.marker} ref={markerRef}>
            <Ixon width="2rem" className={classes.markerIcon}>
              <LocationIcon />
            </Ixon>
          </div>
        </div>
      </div>
      <FormActions>
        <Button
          onClick={() => {
            if (!!isLoading) return;
            if (!selected)
              return pushNotification(
                getContent("missingLocationErrorMessage"),
                "Warn"
              );
            setIsLoading({ location: selected.toArray() });
          }}
          isLoading={!!isLoading}
        >
          {getContent("submit")}
        </Button>
      </FormActions>
      <Act
        path={isLoading ? `${API}/doctor/profile` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
        }}
        payload={isLoading || undefined}
      />
    </div>
  );
};

export default DoctorManageLocationTab;
