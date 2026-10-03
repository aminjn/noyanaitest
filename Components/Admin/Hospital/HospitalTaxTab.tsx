"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import ResetToDefaultButton from "../UI/ResetToDefaultButton";
import classes from "../Clinic/ClinicTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/HospitalTaxSettings.ts (2026-10 admin audit
// P2-10) - one doc per hospital, fetched by filtering the generic
// GET /auto/hospitalTaxSettings list, same pattern as ClinicTaxTab.
// Applied to in-person visits in an office inside this hospital, in place
// of the doctor's visit tax (Lib/taxSettings.ts getVisitTaxPercent). With
// no doc the doctor's own rate stays - there is no platform-wide hospital
// default. No commission here: a hospital is not paid through NoyanAI
// (the doctor is), so a commission would have nothing to apply to.
export interface IHospitalTaxSettings extends MongoDoc {
  hospital: string;
  taxPercent: number;
}

const HospitalTaxTab = ({ node }: { node: { _id: string } }) => {
  const { data, error, mutate } = useSWR<IHospitalTaxSettings[]>(
    `${API}/auto/hospitalTaxSettings?hospital=${node._id}`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        Array.isArray(res?.data?.data) ? res.data.data : [],
      ),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <p className={classes.hint}>
            {ta(
              "روی ویزیت‌های حضوری در مطب‌های داخل این بیمارستان، به‌جای مالیات ویزیت پزشک، این درصد به صورتحساب بیمار اضافه می‌شود. اگر خالی بماند، مالیات ویزیت خود پزشک اعمال می‌شود.",
            )}
          </p>
          <CreateForm<IHospitalTaxSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/hospitalTaxSettings/${existing._id}`
                : `${API}/auto/hospitalTaxSettings`,
              method: "POST",
              decorators: { hospital: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              taxPercent: {
                title: ta("درصد مالیات این بیمارستان"),
                type: "number",
                required: true,
              },
            }}
          />
          <ResetToDefaultButton
            segment="hospitalTaxSettings"
            id={existing?._id}
            mutate={mutate}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default HospitalTaxTab;
