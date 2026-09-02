"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalFinanceSettings } from "../FinanceSettings/AdminManageGlobalFinanceSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./DoctorCommissionTab.module.css";

// Mirrors backend Models/DoctorFinanceSettings.ts - one doc per doctor
// (unique on `doctor`), fetched here by filtering the generic
// GET /auto/doctorFinanceSettings list on the `doctor` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyCommissionTab.tsx. If this
// doctor has no doc yet, the platform falls back to
// GlobalFinanceSettings.defaultDoctorCommissionPercent, shown here for
// context.
export interface IDoctorFinanceSettings extends MongoDoc {
  doctor: string;
  commissionPercent: number;
}

const DoctorCommissionTab = ({ node }: { node: IDoctorProfile }) => {
  const { data, error, mutate } = useSWR<IDoctorFinanceSettings[]>(
    `${API}/auto/doctorFinanceSettings?doctor=${node._id}`,
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
                title="درصد کمیسیون پیش‌فرض سیستم (در صورت تنظیم نشدن)"
                value={`${globalSettings.defaultDoctorCommissionPercent}%`}
              />
            </List>
          )}
          <CreateForm<IDoctorFinanceSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/doctorFinanceSettings/${existing._id}`
                : `${API}/auto/doctorFinanceSettings`,
              method: "POST",
              decorators: { doctor: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              commissionPercent: {
                title: "درصد کمیسیون این پزشک",
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

export default DoctorCommissionTab;
