"use client";

import LocationForm from "@/Components/Map/LocationForm";
import useHospital from "@/Components/Hooks/useHospital";
import { API } from "@/Components/config";

// The point, its address and province / city / district: the shared panel
// location form (Components/Map/LocationForm).
const HospitalManageLocationTab = () => {
  const { hospital, mutate } = useHospital();
  return (
    <LocationForm
      path={`${API}/hospital/profile`}
      entity={hospital}
      mutate={mutate}
      withDivisions
    />
  );
};

export default HospitalManageLocationTab;
