"use client";

import PointPicker from "@/Components/Admin/UI/PointPicker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useInsurance from "@/Components/Hooks/useInsurance";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";

const NS: ContentNamespace[] = ["common", "insurancePanelProfile"];

type LocationFormInput = {
  coords: [number, number];
};

// Simpler than HospitalManageLocationTab - Models/Insurance.ts has no
// province/city/district refs, just a plain `address` string (edited on the
// Details tab) + `location` point (2026-09).
const InsuranceManageLocationTab = () => {
  const { insurance, mutate } = useInsurance();

  const getContent = useScopedLocale(NS);

  const { input, setInput, isLoading, submit } = useForm<LocationFormInput>({
    path: `${API}/insurance/profile`,
    method: "POST",
    hasProblem: (inp) =>
      !inp.coords ? getContent("missingLocationErrorMessage") : undefined,
    mutator: (inp) => ({
      location: inp.coords,
    }),
    successCb: () => mutate(),
  });

  return (
    <div>
      <PointPicker
        defaultValue={insurance?.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <FormActions>
        <Button onClick={submit} isLoading={isLoading}>
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default InsuranceManageLocationTab;
