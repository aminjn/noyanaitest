"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IGlobalTaxSettings } from "../TaxSettings/AdminManageGlobalTaxSettingsPage";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import classes from "./DoctorTaxTab.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/DoctorTaxSettings.ts - one doc per doctor (unique
// on `doctor`), fetched here by filtering the generic
// GET /auto/doctorTaxSettings list on the `doctor` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyTaxTab.tsx. Unlike the
// pharmacy/clinic/paraClinic tabs, a doctor has TWO independent tax fields -
// visitTaxPercent (booked sessions, Controllers/bookingController.ts) and
// serviceTaxPercent (Service/ServicePackage cart items) - each optional and
// falling back to its own GlobalTaxSettings default independently, so an
// admin can set just one without the other.
export interface IDoctorTaxSettings extends MongoDoc {
  doctor: string;
  visitTaxPercent?: number;
  serviceTaxPercent?: number;
}

const DoctorTaxTab = ({ node }: { node: IDoctorProfile }) => {
  const { data, error, mutate } = useSWR<IDoctorTaxSettings[]>(
    `${API}/auto/doctorTaxSettings?doctor=${node._id}`,
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
                title={ta("درصد مالیات پیش‌فرض ویزیت (در صورت تنظیم نشدن)")}
                value={`${globalSettings.defaultDoctorVisitTaxPercent}%`}
              />
              <DataPair
                title={ta("درصد مالیات پیش‌فرض خدمات (در صورت تنظیم نشدن)")}
                value={`${globalSettings.defaultDoctorServiceTaxPercent}%`}
              />
            </List>
          )}
          <CreateForm<IDoctorTaxSettings>
            defaultValue={existing}
            hookProps={{
              path: existing
                ? `${API}/auto/doctorTaxSettings/${existing._id}`
                : `${API}/auto/doctorTaxSettings`,
              method: "POST",
              decorators: { doctor: node._id },
              successCb: () => mutate(),
            }}
            renderer={{
              visitTaxPercent: {
                title: ta("درصد مالیات ویزیت این پزشک"),
                type: "number",
              },
              serviceTaxPercent: {
                title: ta("درصد مالیات خدمات این پزشک"),
                type: "number",
              },
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorTaxTab;
