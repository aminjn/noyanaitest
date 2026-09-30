"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalTaxSettings } from "../TaxSettings/AdminManageGlobalTaxSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./ParaClinicTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/ParaClinicTaxSettings.ts - one doc per paraClinic
// (unique on `paraClinic`), fetched here by filtering the generic
// GET /auto/paraClinicTaxSettings list on the `paraClinic` query param, same
// pattern as ParaClinicCommissionTab.tsx. If this paraClinic has no doc yet,
// the platform falls back to GlobalTaxSettings.defaultParaClinicTaxPercent,
// shown here for context.
export interface IParaClinicTaxSettings extends MongoDoc {
  paraClinic: string;
  taxPercent: number;
}

const ParaClinicTaxTab = ({ node }: { node: IParaClinic }) => {
  const { data, error, mutate } = useSWR<IParaClinicTaxSettings[]>(
    `${API}/auto/paraClinicTaxSettings?paraClinic=${node._id}`,
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
                value={`${globalSettings.defaultParaClinicTaxPercent}%`}
              />
            </List>
          )}
          <CreateForm<IParaClinicTaxSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/paraClinicTaxSettings/${existing._id}`
                : `${API}/auto/paraClinicTaxSettings`,
              method: "POST",
              decorators: { paraClinic: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              taxPercent: {
                title: ta("درصد مالیات این پاراکلینیک"),
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

export default ParaClinicTaxTab;
