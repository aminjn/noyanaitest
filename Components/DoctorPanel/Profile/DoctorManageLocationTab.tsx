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
import {
  ICity,
  IDistrict,
  IProvince,
} from "@/Components/Admin/Province/AdminManageProvincesPage";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";

const DoctorManageLocationTab = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<LngLat | null>(null);

  const { doctor, mutate } = useDoctor();

  const { data: geo } = useSWR<{
    district: IDistrict | null;
    city: ICity | null;
    province: IProvince | null;
  }>(
    !!selected || !!doctor?.location?.coordinates
      ? `${API}/public/resolveLocation?lat=${selected ? selected.lat : doctor?.location?.coordinates[1]}&lng=${selected ? selected.lng : doctor?.location?.coordinates[0]}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      keepPreviousData: true,
    },
  );

  const getContent = useLocale();

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
      {!!geo && (
        <div className={classes.resolved}>
          {[geo.province, geo.city, geo.district]
            .filter((el) => !!el)
            .map((el) => el.name)
            .join(" - ")}
        </div>
      )}
      <div className={classes.main} ref={containerRef}>
        {ready ? (
          <Fragment>
            {doctor?.location?.coordinates && (
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
      </div>
      <FormActions>
        <Button
          onClick={() => {
            if (!!isLoading) return;
            if (!selected)
              return pushNotification(
                getContent("missingLocationErrorMessage"),
                "Warn",
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
