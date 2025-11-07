import { IOffice } from "./DoctorManageOfficesPage";
import classes from "./DoctorManageOfficeLocationTab.module.css";
import { Fragment, useRef, useState } from "react";
import useMap from "@/Components/Hooks/useMap";
import { LngLat } from "maplibre-gl";
import MapMarker from "@/Components/UI/MapMarker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import { NEXT_META_SUFFIX } from "next/dist/lib/constants";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DoctorManageOfficeLocationTab = ({
  mutate,
  office,
}: {
  office: IOffice;
  mutate: () => unknown;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<LngLat | null>(null);

  const [isLoading, setIsLoading] = useState<[number, number] | null>(null);

  const { map, ready } = useMap({
    containerRef,
    onClick: setSelected,
    center: office.location?.coordinates,
  });

  const getContent = useLocale();

  const pushNotification = useNotification();

  return (
    <div className={classes.main}>
      <div className={classes.map} ref={containerRef}>
        {ready && (
          <Fragment>
            {!!office.location?.coordinates && (
              <MapMarker
                map={map}
                variant="active"
                lat={office.location.coordinates[0]}
                lng={office.location.coordinates[1]}
              />
            )}
            {!!selected && (
              <MapMarker map={map} lng={selected.lng} lat={selected.lat} />
            )}
            {!!office.location?.coordinates && (
              <MapMarker
                map={map}
                lng={office.location.coordinates[0]}
                lat={office.location.coordinates[1]}
                variant="doctor"
              />
            )}
          </Fragment>
        )}
      </div>
      <FormActions>
        <Button
          onClick={() => {
            if (!selected) return pushNotification("checkInput", "Warn");
            setIsLoading(selected.toArray());
          }}
          isLoading={!!isLoading}
        >
          {getContent("submit")}
        </Button>
      </FormActions>
      <Act
        path={isLoading ? `${API}/doctor/office/${office._id}` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
        }}
        payload={{ location: isLoading }}
      />
    </div>
  );
};

export default DoctorManageOfficeLocationTab;
