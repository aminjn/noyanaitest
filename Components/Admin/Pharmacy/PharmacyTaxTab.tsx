"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalTaxSettings } from "../TaxSettings/AdminManageGlobalTaxSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./PharmacyTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/PharmacyTaxSettings.ts - one doc per pharmacy
// (unique on `pharmacy`), fetched here by filtering the generic
// GET /auto/pharmacyTaxSettings list on the `pharmacy` query param (same
// pattern as PharmacyCommissionTab.tsx). If this pharmacy has no doc yet,
// the platform falls back to GlobalTaxSettings.defaultPharmacyTaxPercent,
// shown here for context.
export interface IPharmacyTaxSettings extends MongoDoc {
  pharmacy: string;
  taxPercent: number;
}

const PharmacyTaxTab = ({ node }: { node: IPharmacy }) => {
  const { data, error, mutate } = useSWR<IPharmacyTaxSettings[]>(
    `${API}/auto/pharmacyTaxSettings?pharmacy=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { data: globalSettings } = useSWR<IGlobalTaxSettings>(
    `${API}/auto/globalTaxSettings`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          {!!globalSettings && (
            <List>
              <DataPair
                title={ta("درصد مالیات پیش‌فرض سیستم (در صورت تنظیم نشدن)")}
                value={`${globalSettings.defaultPharmacyTaxPercent}%`}
              />
            </List>
          )}
          <CreateForm<IPharmacyTaxSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/pharmacyTaxSettings/${existing._id}`
                : `${API}/auto/pharmacyTaxSettings`,
              method: "POST",
              decorators: { pharmacy: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              taxPercent: {
                title: ta("درصد مالیات این داروخانه"),
                type: "number",
                required: true,
              },
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default PharmacyTaxTab;
