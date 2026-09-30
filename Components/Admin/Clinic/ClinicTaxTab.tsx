"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IClinic } from "./AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalTaxSettings } from "../TaxSettings/AdminManageGlobalTaxSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./ClinicTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/ClinicTaxSettings.ts - one doc per clinic (unique
// on `clinic`), fetched here by filtering the generic
// GET /auto/clinicTaxSettings list on the `clinic` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyTaxTab.tsx. If this clinic
// has no doc yet, the platform falls back to
// GlobalTaxSettings.defaultClinicTaxPercent, shown here for context.
//
// Note: unlike the pharmacy/doctor/paraClinic tabs, this rate isn't applied
// anywhere yet - Clinic owns no sellable/payable item or flow in this
// codebase today (see Models/ClinicTaxSettings.ts's comment). This tab
// exists for admin-UI parity (2026-09 user decision).
export interface IClinicTaxSettings extends MongoDoc {
  clinic: string;
  taxPercent: number;
}

const ClinicTaxTab = ({ node }: { node: IClinic }) => {
  const { data, error, mutate } = useSWR<IClinicTaxSettings[]>(
    `${API}/auto/clinicTaxSettings?clinic=${node._id}`,
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
                value={`${globalSettings.defaultClinicTaxPercent}%`}
              />
            </List>
          )}
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
        </div>
      )}
    </HandleLoading>
  );
};

export default ClinicTaxTab;
