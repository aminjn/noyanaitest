"use client";

import LocationForm from "@/Components/Map/LocationForm";
import useParaClinic from "@/Components/Hooks/useParaClinic";
import { API } from "@/Components/config";

// The point, its address and province / city / district: the shared panel
// location form (Components/Map/LocationForm).
const ParaClinicManageLocationTab = () => {
  const { paraClinic, mutate } = useParaClinic();
  return (
    <LocationForm
      path={`${API}/paraClinic/profile`}
      entity={paraClinic}
      mutate={mutate}
      withDivisions
    />
  );
};

export default ParaClinicManageLocationTab;
