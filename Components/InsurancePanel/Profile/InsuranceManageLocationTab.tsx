"use client";

import LocationForm from "@/Components/Map/LocationForm";
import useInsurance from "@/Components/Hooks/useInsurance";
import { API } from "@/Components/config";

// Models/Insurance.ts has no province/city/district refs, just a plain
// `address` string + `location` point: the shared panel location form
// without the division selects.
const InsuranceManageLocationTab = () => {
  const { insurance, mutate } = useInsurance();
  return (
    <LocationForm
      path={`${API}/insurance/profile`}
      entity={insurance}
      mutate={mutate}
    />
  );
};

export default InsuranceManageLocationTab;
