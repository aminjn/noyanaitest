"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalFinanceSettings } from "../FinanceSettings/AdminManageGlobalFinanceSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import ResetToDefaultButton from "../UI/ResetToDefaultButton";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./PharmacyCommissionTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/PharmacyFinanceSettings.ts - one doc per pharmacy
// (unique on `pharmacy`), fetched here by filtering the generic
// GET /auto/pharmacyFinanceSettings list on the `pharmacy` query param
// (mirrors the ParaClinicTestManager `?paraClinic=` pattern elsewhere in
// this file's sibling AdminManageParaClinicPage.tsx). If this pharmacy has
// no doc yet, the platform falls back to
// GlobalFinanceSettings.defaultPharmacyCommissionPercent, shown here for
// context.
export interface IPharmacyFinanceSettings extends MongoDoc {
  pharmacy: string;
  commissionPercent: number;
}

const PharmacyCommissionTab = ({ node }: { node: IPharmacy }) => {
  const { data, error, mutate } = useSWR<IPharmacyFinanceSettings[]>(
    `${API}/auto/pharmacyFinanceSettings?pharmacy=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { data: globalSettings } = useSWR<IGlobalFinanceSettings>(
    `${API}/auto/globalFinanceSettings`,
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
                title={ta("درصد کمیسیون پیش‌فرض سیستم (در صورت تنظیم نشدن)")}
                value={`${globalSettings.defaultPharmacyCommissionPercent}%`}
              />
            </List>
          )}
          <CreateForm<IPharmacyFinanceSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/pharmacyFinanceSettings/${existing._id}`
                : `${API}/auto/pharmacyFinanceSettings`,
              method: "POST",
              decorators: { pharmacy: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              commissionPercent: {
                title: ta("درصد کمیسیون این داروخانه"),
                type: "number",
                required: true,
              },
            }}
          />
          <ResetToDefaultButton
            segment="pharmacyFinanceSettings"
            id={existing?._id}
            mutate={mutate}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default PharmacyCommissionTab;
