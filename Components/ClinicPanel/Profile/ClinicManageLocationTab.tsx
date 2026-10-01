"use client";

import LocationForm from "@/Components/Map/LocationForm";
import useClinic from "@/Components/Hooks/useClinic";
import { API } from "@/Components/config";

// The point, its address and province / city / district: the shared panel
// location form (Components/Map/LocationForm).
const ClinicManageLocationTab = () => {
  const { clinic, mutate } = useClinic();
  return (
    <LocationForm
      path={`${API}/clinic/profile`}
      entity={clinic}
      mutate={mutate}
      withDivisions
    />
  );
};

export default ClinicManageLocationTab;
