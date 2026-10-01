"use client";

import LocationForm from "@/Components/Map/LocationForm";
import useDoctor from "@/Components/Hooks/useDoctor";
import { API } from "@/Components/config";

// The point, its address and province / city / district: the shared panel
// location form (Components/Map/LocationForm).
const DoctorManageLocationTab = () => {
  const { doctor, mutate } = useDoctor();
  return (
    <LocationForm
      path={`${API}/doctor/profile`}
      entity={doctor}
      mutate={mutate}
      withDivisions
    />
  );
};

export default DoctorManageLocationTab;
