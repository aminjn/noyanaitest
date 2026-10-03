"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IClinic } from "./AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import ResetToDefaultButton from "../UI/ResetToDefaultButton";
import classes from "./ClinicTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/ClinicTaxSettings.ts - one doc per clinic (unique
// on `clinic`), fetched here by filtering the generic
// GET /auto/clinicTaxSettings list on the `clinic` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyTaxTab.tsx. If this clinic
// has no doc yet, the platform falls back to
// GlobalTaxSettings.defaultClinicTaxPercent, shown here for context.
//
// Applied to in-person visits in an office inside this clinic, in place
// of the doctor's visit tax (backend Lib/taxSettings.ts getVisitTaxPercent).
export interface IClinicTaxSettings extends MongoDoc {
  clinic: string;
  taxPercent: number;
}

const ClinicTaxTab = ({ node }: { node: IClinic }) => {
  const { data, error, mutate } = useSWR<IClinicTaxSettings[]>(
    `${API}/auto/clinicTaxSettings?clinic=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );


  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <p className={classes.hint}>
            {ta(
              "روی ویزیت‌های حضوری در مطب‌های داخل این کلینیک، به‌جای مالیات ویزیت پزشک، این درصد به صورتحساب بیمار اضافه می‌شود (فقط اگر پزشک در سامانه‌ی مودیان فعال باشد). اگر خالی بماند، مالیات ویزیت خود پزشک اعمال می‌شود.",
            )}
          </p>
          <CreateForm<IClinicTaxSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/clinicTaxSettings/${existing._id}`
                : `${API}/auto/clinicTaxSettings`,
              method: "POST",
              decorators: { clinic: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              taxPercent: {
                title: ta("درصد مالیات این کلینیک"),
                type: "number",
                required: true,
              },
            }}
          />
          <ResetToDefaultButton
            segment="clinicTaxSettings"
            id={existing?._id}
            mutate={mutate}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default ClinicTaxTab;
