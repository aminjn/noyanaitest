import useMap from "@/Components/Hooks/useMap";
import { Fragment, useRef, useState } from "react";
import classes from "./DoctorProfileLocationTab.module.css";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { mutate } from "swr";
import MapMarker from "@/Components/UI/MapMarker";
import { ta } from "@/Components/Admin/i18n/adminText";

const DoctorProfileLocationTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { input, setInput, isLoading, submit } = useForm<{
    lat: number;
    lng: number;
  }>({
    path: `${API}/auto/doctorprofile/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => {
      if (inp.lat && inp.lng)
        return { location: { type: "Point", coordinates: [inp.lng, inp.lat] } };
      return inp;
    },
  });

  const { map, ready } = useMap({
    containerRef: mapRef,
    onClick: (e) => setInput((prev) => ({ ...prev, lat: e.lat, lng: e.lng })),
    center: node.location?.coordinates,
  });

  return (
    <div className={classes.main}>
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <Fragment>
            {node.location?.coordinates && (
              <MapMarker
                lat={node.location.coordinates[1]}
                lng={node.location.coordinates[0]}
                map={map}
                variant="active"
              />
            )}
            {input.lat && input.lng && (
              <MapMarker lat={input.lat} lng={input.lng} map={map} />
            )}
          </Fragment>
        )}
      </div>
      <FormActions>
        <Button isLoading={isLoading} onClick={submit}>
          {ta("تایید")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DoctorProfileLocationTab;
