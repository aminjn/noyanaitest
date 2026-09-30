"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalFinanceSettings } from "../FinanceSettings/AdminManageGlobalFinanceSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./ParaClinicCommissionTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/ParaClinicFinanceSettings.ts - one doc per
// paraClinic (unique on `paraClinic`), fetched here by filtering the
// generic GET /auto/paraClinicFinanceSettings list on the `paraClinic`
// query param, same pattern as
// Components/Admin/Pharmacy/PharmacyCommissionTab.tsx. If this paraClinic
// has no doc yet, the platform falls back to
// GlobalFinanceSettings.defaultParaClinicCommissionPercent, shown here for
// context.
export interface IParaClinicFinanceSettings extends MongoDoc {
  paraClinic: string;
  commissionPercent: number;
}

const ParaClinicCommissionTab = ({ node }: { node: IParaClinic }) => {
  const { data, error, mutate } = useSWR<IParaClinicFinanceSettings[]>(
    `${API}/auto/paraClinicFinanceSettings?paraClinic=${node._id}`,
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
                value={`${globalSettings.defaultParaClinicCommissionPercent}%`}
              />
            </List>
          )}
          <CreateForm<IParaClinicFinanceSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/paraClinicFinanceSettings/${existing._id}`
                : `${API}/auto/paraClinicFinanceSettings`,
              method: "POST",
              decorators: { paraClinic: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              commissionPercent: {
                title: ta("درصد کمیسیون این پاراکلینیک"),
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

export default ParaClinicCommissionTab;
