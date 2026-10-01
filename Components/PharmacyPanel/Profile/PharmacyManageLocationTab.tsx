"use client";

import LocationForm from "@/Components/Map/LocationForm";
import usePharmacy from "@/Components/Hooks/usePharmacy";
import { API } from "@/Components/config";

// The point, its address and province / city / district: the shared panel
// location form (Components/Map/LocationForm).
const PharmacyManageLocationTab = () => {
  const { pharmacy, mutate } = usePharmacy();
  return (
    <LocationForm
      path={`${API}/pharmacy/profile`}
      entity={pharmacy}
      mutate={mutate}
      withDivisions
    />
  );
};

export default PharmacyManageLocationTab;
