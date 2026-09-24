import { IOffice } from "./DoctorManageOfficesPage";
import classes from "./DoctorManageOfficeLocationTab.module.css";
import { Fragment, useRef, useState } from "react";
import useMap from "@/Components/Hooks/useMap";
import { LngLat } from "maplibre-gl";
import MapMarker from "@/Components/UI/MapMarker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { NEXT_META_SUFFIX } from "next/dist/lib/constants";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import PointPicker from "@/Components/Admin/UI/PointPicker";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelOffice"];

const DoctorManageOfficeLocationTab = ({
  mutate,
  office,
}: {
  office: IOffice;
  mutate: () => unknown;
}) => {
  const { setInput, isLoading, submit, input } = useForm<{
    coords: [number, number];
  }>({
    path: `${API}/doctor/office/${office._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => ({ location: inp.coords }),
  });

  const getContent = useScopedLocale(NS);

  const pushNotification = useNotification();

  return (
    <div className={classes.main}>
      <PointPicker
        defaultValue={office.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <FormActions>
        <Button
          onClick={() => {
            if (!input.coords) return pushNotification("checkInput", "Warn");
            submit();
          }}
          isLoading={!!isLoading}
        >
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DoctorManageOfficeLocationTab;
